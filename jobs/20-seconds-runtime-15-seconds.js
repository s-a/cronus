"use strict";

var Job = function() {
	this.cronPattern = "*/20 * * * * *";
	this.name = "unicorn timeout";
	this.description = "20-seconds rotating timeout";
	this.iconCssClassName = "fa fa-calendar-times-o";
	this.shouldTimeout = false;
	return this;
};


Job.prototype.testAsnc = function(controller, done) {
	var time = 2000;
	if (this.shouldTimeout){
		time = 6000;
	}
	this.shouldTimeout = !this.shouldTimeout;
	
	setTimeout(function () {
		done(true);
	}, time);
	//return true;
};

module.exports = Job;