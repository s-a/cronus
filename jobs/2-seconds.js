"use strict";

var Job = function() {
	this.cronPattern = "*/2 * * * * *";
	this.name = "unicorn 2";
	this.description = "You will see this message every 2 seconds";

	return this;
};


Job.prototype.test = function(/*controller*/) {
	return true;
};

module.exports = Job;