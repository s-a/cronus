"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.name = "test22";
	this.description = "You will see this message every second";

	return this;
};


Job.prototype.test = function(controller) {
	controller.log.info("done");
	return true;
};

module.exports = Job;