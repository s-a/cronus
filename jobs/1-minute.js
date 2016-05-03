"use strict";

var Job = function() {
	this.cronPattern = "0-59 * * * 0-6";
	this.name = "unicorn M";
	this.description = "You will see this message every minute (the whole week)";

	return this;
};


Job.prototype.test = function(/*controller*/) {
	return true;
};

module.exports = Job;