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


var i = 0;
var cron = new CronJob('* * * * * *', function() {
	i++;
	io.sockets.emit('news', { hello: 'foo ' + new Date().getTime() });
  	console.log('You will see this message every second');
  	if (i===10) {
  		io.sockets.emit('news', { hello: 'stopped' });
  		cron.stop();
  	}
}, null, false, 'America/Los_Angeles');

cron.start();