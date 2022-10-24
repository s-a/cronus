'use strict'

const Job = function() {
	this.cronPattern = '* * * * * *'
	this.name = 'unicorn ONE'
	this.description = 'You will see this message every second. Always fails'
	this.iconCssClassName = 'fa fa-database'

	return this
}

Job.prototype.verify = async function(/* controller */) {
	return false
}

module.exports = Job