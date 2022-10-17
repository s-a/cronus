#!/usr/bin/env node
"use strict";

var minimist = require("minimist");
var express = require("express");
var app = require("express")();
var Server = require("http").Server;
var server = new Server(app);
var io = require("socket.io")(server);


var argv = minimist(process.argv.slice(2));

var port = argv.port || 3000;
server.listen(port);

app.use(express.static("public"));
app.use(express.static("node_modules/socket.io/client-dist/"));


var JobController = require("./job-controller");
var jobController = new JobController(io);
var pack = require("./../package.json");
var serverStartTime = new Date().getTime();

io.on("connection", function (socket) {
	socket.emit("init", { crons: jobController.jobs, package: pack, serverStartTime: serverStartTime });
	/*socket.on("my other event", function (data) {
	console.log(data);
	});*/
});

jobController.log.info("starting server at ", port);
jobController.initialize();