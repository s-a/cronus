var chokidar = require('chokidar');
var glob = require('glob');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var CronJob = require('cron').CronJob;



server.listen(80);

app.use(express.static('public'));
app.use(express.static('node_modules/socket.io/node_modules/socket.io-client/'));


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'unicorn' });
  /*socket.on('my other event', function (data) {
    console.log(data);
  });*/
});



var jobs = glob.sync("./tests/*.js");
console.log(jobs);


var Job = require("./tests/test22.js");
var job = new Job();

var i = 0;
var cron = new CronJob(job.cronPattern, function() {

	var result = job.test();

	io.sockets.emit('news', { hello: 'foo ' + new Date().getTime() + " " + result });

}, null, false);

cron.start();


// Initialize watcher.
var watcher = chokidar.watch("./tests", {
  ignored: /[\/\\]\./,
  persistent: true
});



var onChange = function (path1, path2) {
	io.sockets.emit('news', { hello: path1 + " " + path2 });
};

watcher
  .on('add', onChange)
  .on('change', onChange)
  .on('unlink', onChange)
  .on('rename', onChange);