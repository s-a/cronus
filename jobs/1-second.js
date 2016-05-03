"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.name = "unicorn ONE";
	this.description = "You will see this message every second";

	return this;
};


Job.prototype.test = function(/*controller*/) {
	return false;
};

module.exports = Job;