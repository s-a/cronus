'use strict'

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const bunyan = require('bunyan')
const CronJob = require('cron').CronJob
const prettyCron = require('prettycron')
const pTimeout = require('p-timeout')

function JobController(io, folders, bunyanLogSettings) {
	this.maxLogItems = 10
	this.folders = folders
	this.validateArguments()
	this.log = bunyan.createLogger(bunyanLogSettings)

	this.io = io
	this.jobs = {}
	this.crons = {}
	return this
}

JobController.prototype.isAsync = (p) => {
	const result = p.constructor.name === 'AsyncFunction'
	return result
}

JobController.prototype.validateArguments = function () {
	for (let f = 0; f < this.folders.length; f++) {
		const folder = this.folders[f]
		if (!fs.existsSync(folder)) {
			// eslint-disable-next-line no-console
			console.log(`Directory "${folder} does not exist"`)
			// eslint-disable-next-line no-process-exit
			process.exit(1)
		}
	}
}

JobController.prototype.initialize = function () {
	for (let i = 0; i < this.folders.length; i++) {
		const folder = this.folders[i]
		this.log.info('watch', folder)
		const watcher = chokidar.watch(path.resolve(folder), {
			ignored: /[/\\]\./,
			persistent: true
		})

		watcher
			.on('add', this.fileChange.bind(this))
			.on('change', this.fileChange.bind(this))
			.on('unlink', this.fileChange.bind(this))
			.on('rename', this.fileChange.bind(this))
	}
}

JobController.prototype.execute = async function () {
	const self = this

	this.job.lastStart = new Date().getTime()
	this.job.prettyCron = prettyCron.toString(this.job.cronPattern)

	this.controller.log.info('exec ', this.job.filename)
	this.controller.emitResult(this.job/*, undefined */) // emit job started

	if (typeof this.job.verify === 'function') {
		if (this.controller.isAsync(this.job.verify)) {
			if (typeof this.job.timeout === 'number') {
				try {
					await pTimeout(this.job.verify(this), this.job.timeout)
				} catch (e) {
					this.controller.emitError(e, this.job)
				}
			} else {
				const res = await this.job.verify(this.controller)
				self.controller.log.info('done ', self.job.filename, res)
				self.controller.emitResult(self.job, res)
			}
		} else {
			const e = new Error(`${this.job.filename} verify method is not a promise. Skip Job`)
			this.controller.emitError(e, this.job)
		}
	} else {
		const e = new Error(`${this.job.filename} does not contain verify method. Skip Job`)
		this.controller.emitError(e, this.job)
	}
}

JobController.prototype.schedule = function (job) {
	this.log.info('prepare cron ', job.filename)
	const context = {
		job: job,
		controller: this
	}
	// constructor(cronTime, onTick, onComplete, start, timezone, context, runOnInit, utcOffset, unrefTimeout)
	const cronTime = job.cronPattern
	const onTick = this.execute
	const onComplete = null
	const start = false
	const timezone = 'Europe/Berlin'
	const runOnInit = false
	const cron = new CronJob(cronTime, onTick, onComplete, start, timezone, context, runOnInit)
	this.jobs[job.filename] = job
	this.crons[job.filename] = cron
	this.emitResult(job, null)
	return cron
}

JobController.prototype.stop = function (path) {
	if (this.crons[path]) {
		this.log.info('stop ', path)
		this.crons[path].stop()
	}
}

JobController.prototype.sliceLog = function (log) {
	if (log.length > this.maxLogItems) {
		// eslint-disable-next-line no-param-reassign
		log = log.slice(0, this.maxLogItems)
	}
	return log
}

JobController.prototype.initError = function (result) {
	let err = result
	if (result === true || result === false) {
		err = !result
	}
	return err
}

JobController.prototype.emitResult = function (job, result) {
	if (!job.log) {
		// eslint-disable-next-line no-param-reassign
		job.log = []
	}

	const err = this.initError(result)
	job.log.unshift({ err: err, date: job.lastStart })
	// eslint-disable-next-line no-param-reassign
	job.log = this.sliceLog(job.log)
	this.io.sockets.emit('job-done', { job: job, result: result })
}

JobController.prototype.emitError = function (e, job) {
	if (job) {
		const exception = JSON.parse(JSON.stringify(e))
		exception.message = e.message
		job.log.unshift({ err: true, date: job.lastStart, exception })
		if (job.log.length > this.maxLogItems) {
			// eslint-disable-next-line no-param-reassign
			job.log = job.log.slice(0, this.maxLogItems)
		}
	}

	this.io.sockets.emit('error', { job: job, exception: e, result: false })
	this.log.error(e)
}

JobController.prototype.emitRemoved = function (path) {
	this.io.sockets.emit('removed', { path: path })
	this.log.warn('removed file ' + path)
}

JobController.prototype.load = function (path, fileinfo) {
	let job

	try {
		this.stop(path)
		delete require.cache[require.resolve(path)]
		const JOB = require(path)
		job = new JOB()
		job.log = []
		job.filename = path
		job.fileinfo = fileinfo
		job.prettyCron = prettyCron.toString(job.cronPattern)

		const cron = this.schedule(job)
		cron.start()
	} catch (e) {
		this.emitError(e, job)
	}
}

JobController.prototype.fileChange = function (path, fileinfo) {
	this.log.info('prepare', path)
	this.load(path, fileinfo)
}

module.exports = JobController