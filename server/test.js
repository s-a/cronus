"use strict";

var path = require("path");
var minimist = require("minimist");
var argv = minimist(process.argv.slice(2));

if (argv.script){
	var JOB = require(path.resolve(argv.script));
	var job = new JOB();
	console.log("start");
	var result = job.test();
	console.log("result", result);
	console.log("done");
}