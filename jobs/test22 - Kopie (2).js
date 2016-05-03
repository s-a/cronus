"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.name = "test24";
	this.description = "You will see this message every second";

	return this;
};


Job.prototype.test = function(controller) {
	controller.log.info("done");

	controller.io.sockets.emit("job-done", { job:this, filename: __filename, msg : "done",  result:true });

	return true;
};

module.exports = Job;