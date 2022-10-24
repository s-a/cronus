#!/usr/bin/env node

const minimist = require('minimist')
const CronusServer = require('./index.js')

const argv = minimist(process.argv.slice(2))
const port = argv.port || 3000

const cronusServer = new CronusServer({
	port,
	folders: [argv.folder],
	bunyanLogSettings: {
		name: 'cronus',
		streams: [
			{
				level: 'trace',
				stream: process.stdout
			}
		]
	}
})

const run = async () => {
	await cronusServer.start()
}

run()