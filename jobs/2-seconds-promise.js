const Job = function () {
	this.cronPattern = '*/2 * * * * *'
	this.name = 'async'
	this.description = 'You will see this message every 2 seconds'

	return this
}

Job.prototype.verify = async function (/* controller */) {
	// controller.log.warn("invoce async test function")
	return true
}

module.exports = Job