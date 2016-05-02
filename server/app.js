var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);


var port = process.env.port || 3000;
server.listen(port);

app.use(express.static('public'));
app.use(express.static('node_modules/socket.io/node_modules/socket.io-client/'));


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'unicorn' });
  /*socket.on('my other event', function (data) {
    console.log(data);
  });*/
});


var JobController = require("./job-controller");
var jobController = new JobController(io);

jobController.log.info("starting server at ", port);

jobController.initialize();
/*
var jobs = glob.sync("./tests/*.js");
console.log(jobs);
console.log(path.resolve("./tests/test22.js"));


var Job = require(path.resolve("./tests/test22.js"));
var job = new Job();

var i = 0;
var cron = new CronJob(job.cronPattern, function() {

	var result = job.test();

	io.sockets.emit('news', { hello: 'foo ' + new Date().getTime() + " " + result });

}, null, false);

cron.start();*/


