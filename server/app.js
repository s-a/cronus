#!/usr/bin/env node
'use strict'

const minimist = require('minimist')
const express = require('express')
const app = require('express')()
const Server = require('http').Server
const server = new Server(app)
const io = require('socket.io')(server)

const argv = minimist(process.argv.slice(2))

const port = argv.port || 3000
server.listen(port)

app.use(express.static('public'))
app.use(express.static('node_modules/socket.io/client-dist/'))

const JobController = require('./job-controller')
const jobController = new JobController(io)
const pack = require('./../package.json')
const serverStartTime = new Date().getTime()

io.on('connection', function (socket) {
	socket.emit('init', { crons: jobController.jobs, package: pack, serverStartTime: serverStartTime })
	/* socket.on("my other event", function (data) {
	console.log(data);
	}); */
})

jobController.log.info('starting server at ', port)
jobController.initialize()