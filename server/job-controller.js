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
	    {
	      level: "info",
	      path: path.join(path.resolve(argv.logFolder || __dirname), "app.log")
	    },
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
	try{
		if (this.crons[path]){
			this.crons[path].stop();
		}
		var self = this;
		var JOB = require(path);
		var job = new JOB()
		job.filename = path;
		job.fileinfo = fileinfo;
		this.log.info("testing monitor method .test()", path);
		job.test(this);

		this.log.info("prepare cron ", path);
		var cron = new CronJob(job.cronPattern, function() {
			self.log.info("exec ", this.filename);
			job.test(self);
		});

		this.crons[path] = cron;
		cron.start();

	} catch(e){
		this.io.sockets.emit('error', { exception: e, filename: path, fileinfo: fileinfo });
		this.log.error(e);
	}
};

JobController.prototype.fileChange = function(path, fileinfo) {
	this.log.info("prepare", path);
	this.loadJob(path, fileinfo);
};

module.exports = JobController;