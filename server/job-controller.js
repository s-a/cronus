"use strict";


var path = require("path");
var chokidar = require("chokidar");
var minimist = require("minimist");
var bunyan = require("bunyan");
var CronJob = require("cron").CronJob;


function JobController(io) {
	var argv = minimist(process.argv.slice(2));
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

JobController.prototype.loadJob = function(path, fileinfo) {
	var job;
	try{
		if (this.crons[path]){
			this.crons[path].stop();
		}
		var self = this;
		delete require.cache[require.resolve(path)];
		var JOB = require(path);
		job = new JOB()
		job.log = [];
		job.filename = path;
		job.fileinfo = fileinfo;
		this.log.info("testing monitor method .test()", path);
		job.test(this);

		this.log.info("prepare cron ", path);
		var result = false;
		var cron = new CronJob(job.cronPattern, function() {
			self.log.info("exec ", job.filename);
			job.lastStart = new Date().getTime();
			try{
				result = job.test(self);
				job.log.push({err: !result, date: job.lastStart});
			} catch(ex){
				self.log.error(ex);
				job.log.push({err: true, date: job.lastStart, exception: ex});
				self.io.sockets.emit("error", { job : job, result: result, exception: ex });
			}
			if (job.log.length > 10){
				job.log = job.log.slice(1).slice(-10);
			}
			self.io.sockets.emit("job-done", { job : job, result: result });
		});

		this.jobs[path] = job;
		this.crons[path] = cron;
		cron.start();

	} catch(e){
		job.log.push({err: true, date: job.lastStart, exception: e});
		if (job.log.length > 10){
			job.log = job.log.slice(1).slice(-10);
		}
		this.io.sockets.emit("error", { job : job, exception: e, filename: path, fileinfo: fileinfo });
		this.log.error(e);
	}
};

JobController.prototype.fileChange = function(path, fileinfo) {
	this.log.info("prepare", path);
	this.loadJob(path, fileinfo);
};

module.exports = JobController;