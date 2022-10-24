'use strict'

const Job = function() {
	this.cronPattern = '*/5 * * * * *'
	this.name = 'unicorn 5'
	this.description = 'You will see this message every 5 seconds'

	return this
}

Job.prototype.verify = async function(/* controller */) {
	return true
}

module.exports = Job