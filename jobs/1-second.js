"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.name = "unicorn ONE";
	this.description = "You will see this message every second";

	return this;
};


Job.prototype.test = function(controller) {
	// controller.log.info("done");

	//throw new Error ("errors"); 
	// controller.io.sockets.emit("job-done", { job: this,  msg: "done",  result: true });

	return false;
};

module.exports = Job;