const Job = function() {
	this.cronPattern = '*/10 * * * * *'
	this.name = 'unicorn 10'
	this.description = 'You will see this message every 10 seconds'
	this.iconCssClassName = 'fa fa-television'
	return this
}

Job.prototype.verify = async function(/* controller */) {
	return true
}

module.exports = Job