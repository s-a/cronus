"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.title = "test22";
	this.desctiption = "You will see this message every second";

	return this;
};


Job.prototype.test = function(controller) {
	controller.log.info("done");
	return true;
};

module.exports = Job;