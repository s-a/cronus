'use strict'

const path = require('path')
const chokidar = require('chokidar')
const minimist = require('minimist')
const bunyan = require('bunyan')
const CronJob = require('cron').CronJob
const prettyCron = require('prettycron')
/* var parser = require('cron-parser'); */

function JobController(io) {
	const argv = minimist(process.argv.slice(2))
	this.maxLogItems = 10
	this.log = bunyan.createLogger({
		name: 'cronus',
		streams: [
			{
				level: 'info',
				stream: process.stdout
			},
			/* {
			  level: "info",
			  path: path.join(path.resolve(argv.logFolder || __dirname), "app.log")
			}, */
			{
				level: 'warn',
				path: path.join(path.resolve(argv.logFolder || __dirname), 'warn.log')
			},
			{
				level: 'error',
				path: path.join(path.resolve(argv.logFolder || __dirname), 'error.log')
			}
		]
	})

	this.io = io
	this.jobs = {}
	this.crons = {}
	return this
}

JobController.prototype.validateArguments = function (argv) {
	if (!argv.folder) {
		// eslint-disable-next-line no-console
		console.log('No job folder specified. Use --folder parameter')
		// eslint-disable-next-line no-process-exit
		process.exit(1)
	}
}

JobController.prototype.initialize = function () {
	const argv = minimist(process.argv.slice(2))
	if (typeof argv.folder === 'string') {
		argv.folder = [argv.folder]
	}

	this.validateArguments(argv)

	for (let i = 0; i < argv.folder.length; i++) {
		const folder = argv.folder[i]
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
	let timeoutTimer = setTimeout(function () {
		timeoutTimer = null
		const err = new Error(self.job.filename + ' timeout (' + self.job.timeout + ')')
		err.errno = 666
		self.controller.emitError(err, self.job) // emit job timed out
	}, this.job.timeout)

	this.job.lastStart = new Date().getTime()
	this.job.prettyCron = prettyCron.toString(this.job.cronPattern)

	if (!this.job.testAsync) {
		this.job.testAsync = function (controller, doneCallback) {
			setTimeout(function () {
				const result = self.job.test(controller)
				doneCallback(result)
			}, 1)
		}
	}

	const done = function (result) {
		clearTimeout(timeoutTimer)
		self.controller.log.info('done ', self.job.filename, result)
		self.controller.emitResult(self.job, result)
	}

	this.controller.log.info('exec ', this.job.filename)
	this.controller.emitResult(this.job/*, undefined */) // emit job started
	if (this.job.verify) {
		const res = await this.job.verify(this.controller)
		done(res)
	} else {
		this.job.testAsync(this.controller, done)
	}
}

JobController.prototype.schedule = function (job) {
	this.log.info('prepare cron ', job.filename)
	const context = {
		job: job,
		controller: this
	}
	const cron = new CronJob(job.cronPattern, this.execute.bind(context))
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
		job.log.unshift({ err: true, date: job.lastStart, exception: e })
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
		job.timeout = job.timeout || 5000
		job.log = []
		job.filename = path
		job.fileinfo = fileinfo
		job.prettyCron = prettyCron.toString(job.cronPattern)

		/* this.log.info("testing monitor method .test() of", path);
		job.test(this); */

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