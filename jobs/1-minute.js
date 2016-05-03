"use strict";

var Job = function() {
	this.cronPattern = "0-59 * * * 0-6";
	this.name = "unicorn M";
	this.description = "You will see this message every minute (the whole week)";

	return this;
};


Job.prototype.test = function(controller) {
	// controller.log.info("done");

	//throw new Error ("errors"); 
	// controller.io.sockets.emit("job-done", { job: this,  msg: "done",  result: true });

	return true;
};

module.exports = Job;