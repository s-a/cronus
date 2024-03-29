/* eslint-disable no-console */
const path = require('path')
const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))

async function run() {
	if (argv.script) {
		const JOB = require(path.resolve(argv.script))
		const job = new JOB()
		console.log('start')
		const result = await job.verify()
		console.log('result', result)
		console.log('done')
	}
}

run()