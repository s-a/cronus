'use strict'

const Job = function() {
	this.cronPattern = '0-59 * * * 0-6'
	this.name = 'unicorn M'
	this.description = 'You will see this message every minute (the whole week)'
	this.iconCssClassName = 'fa fa-plug'

	return this
}

Job.prototype.verify = async function(/* controller */) {
	return true
}