'use strict'

const Job = function () {
	this.cronPattern = '*/5 * * * * *'
	this.name = 'unicorn timeout'
	this.description = '5-seconds rotating timeout'
	this.iconCssClassName = 'fa fa-calendar-times-o'
	this.timeout = 500
	return this
}

Job.prototype.wait = async function (ms) {
	return new Promise(function(resolve) {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

Job.prototype.verify = async function (controller) {
	await this.wait(this.timeout + 100)
	return true
}

module.exports = Job