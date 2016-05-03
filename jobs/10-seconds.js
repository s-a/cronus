"use strict";

var Job = function() {
	this.cronPattern = "*/10 * * * * *";
	this.name = "unicorn 10";
	this.description = "You will see this message every 10 seconds";

	return this;
};


Job.prototype.test = function(controller) {
	return true;
};

module.exports = Job;