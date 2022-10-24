const path = require('path')
const express = require('express')
const app = require('express')()
const Server = require('http').Server
const server = new Server(app)
const io = require('socket.io')(server)
const JobController = require('./job-controller')

const CronusServer = function(options) {
	this.options = options
	this.jobController = new JobController(io, options.folders, options.bunyanLogSettings)
	return this
}

CronusServer.prototype.start = async function() {
	const self = this
	await server.listen(this.options.port, '0.0.0.0')

	app.use(express.static(path.join(__dirname, '../public')))
	app.use(express.static(path.join(__dirname, '../node_modules/socket.io/client-dist/')))

	const pack = require('./../package.json')
	const serverStartTime = new Date().getTime()

	this.connections = new Set()
	io.on('connection', function (socket) {
		self.connections.add(socket)
		socket.emit('init', { crons: self.jobController.jobs, package: pack, serverStartTime: serverStartTime })
	})

	this.jobController.log.info('starting server at ', this.options.port)
	this.jobController.initialize()
}

module.exports = CronusServer