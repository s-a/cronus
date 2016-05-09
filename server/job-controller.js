"use strict";


var path = require("path");
var chokidar = require("chokidar");
var minimist = require("minimist");
var bunyan = require("bunyan");
var CronJob = require("cron").CronJob;
var prettyCron = require('prettycron');
/*var parser = require('cron-parser');*/

function JobController(io) {
	var argv = minimist(process.argv.slice(2));
	this.maxLogItems = 30;
	this.log = bunyan.createLogger({
		name: "cronus",
		streams: [
			{
				level: "info",
				stream: process.stdout
			},
			/*{
			  level: "info",
			  path: path.join(path.resolve(argv.logFolder || __dirname), "app.log")
			},*/
			{
				level: "error",
				path: path.join(path.resolve(argv.logFolder || __dirname), "error.log")
			}
		]
	});

	this.io = io;
	this.jobs = {};
	this.crons = {};
	return this;
}

JobController.prototype.initialize = function() {

	var argv = minimist(process.argv.slice(2));
	if (typeof argv.folder === "string"){
		argv.folder = [argv.folder];
	}

	for (var i = 0; i < argv.folder.length; i++) {
		var folder = argv.folder[i];
		this.log.info("watch", folder);
		var watcher = chokidar.watch(path.resolve(folder), {
		  ignored: /[\/\\]\./,
		  persistent: true
		});

		watcher
		.on("add", this.fileChange.bind(this))
		.on("change", this.fileChange.bind(this))
		.on("unlink", this.fileChange.bind(this))
		.on("rename", this.fileChange.bind(this));
	}
};

JobController.prototype.execute = function() {
	this.controller.log.info("exec ", this.job.filename);
	this.job.lastStart = new Date().getTime();
	this.job.prettyCron = prettyCron.toString(this.job.cronPattern);
	var result = this.job.test(this.controller);
	this.controller.emitResult(this.job, result);
};

JobController.prototype.schedule = function(job) {
	this.log.info("prepare cron ", job.filename);
	var context = {
		job:job,
		controller:this
	}
	var cron = new CronJob(job.cronPattern, this.execute.bind(context));
	this.jobs[job.filename] = job;
	this.crons[job.filename] = cron;
	return cron;
};


JobController.prototype.stop = function(path) {
	if (this.crons[path]){
		this.log.info("stop ", path);
		this.crons[path].stop();
	}
};

JobController.prototype.emitResult = function(job, result) {
	if (!job.log){
		job.log = [];
	}
	job.log.unshift({err: !result, date: job.lastStart});
	if (job.log.length > this.maxLogItems){
		job.log = job.log.slice(1).slice(-this.maxLogItems);
	}
	this.io.sockets.emit("job-done", { job : job, result: result });
};

JobController.prototype.emitError = function(e, job) {
	if(job){
		job.log.unshift({err: true, date: job.lastStart, exception: e});
		if (job.log.length > this.maxLogItems){
			job.log = job.log.slice(1).slice(-this.maxLogItems);
		}
	}
	this.io.sockets.emit("error", { job : job, exception: e, result: false });
	this.log.error(e);
};

JobController.prototype.load = function(path, fileinfo) {
	var job;

	try{
		this.stop(path);
		delete require.cache[require.resolve(path)];
		var JOB = require(path);
		job = new JOB()
		job.log = [];
		job.filename = path;
		job.fileinfo = fileinfo;
		job.prettyCron = prettyCron.toString(job.cronPattern);

		this.log.info("testing monitor method .test() of", path);
		job.test(this);


		var cron = this.schedule(job);
		cron.start();

	} catch(e){
		this.emitError(e, job)
	}
};

JobController.prototype.fileChange = function(path, fileinfo) {
	this.log.info("prepare", path);
	this.load(path, fileinfo);
};

module.exports = JobController;