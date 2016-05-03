# cronus
Schedules custom monitoring jobs and servers a [socket.io](http://socket.io/) connected monitoring website.


## Installation
```bash
$ git clone https://github.com/s-a/cronus.git;
$ cd cronus;
$ npm install;
```

## Start
```bash
$ npm start;
# or
# $node server/app.js --port 3000 --folder ./jobs [--logFolder d:\logs];
```

## Cron patterns

```
 # ┌───────────── min (0 - 59) 
 # │ ┌────────────── hour (0 - 23)
 # │ │ ┌─────────────── day of month (1 - 31)
 # │ │ │ ┌──────────────── month (1 - 12)
 # │ │ │ │ ┌───────────────── day of week (0 - 6) (0 to 6 are Sunday to Saturday, or use names; 7 is Sunday, the same as 0)
 # │ │ │ │ │
 # │ │ │ │ │
 # * * * * *  command to execute
```

Detailed description : [https://en.wikipedia.org/wiki/Cron](https://en.wikipedia.org/wiki/Cron)

## Example monitor job
```javascript
"use strict";

var Job = function() {
	this.cronPattern = "*/10 * * * * *";
	this.name = "unicorn 10";
	this.description = "You will see this message every 10 seconds";

	return this;
};


Job.prototype.test = function(controller) {
	// your job code here.
	return true;
};

module.exports = Job;
```

![Screenshot](/screenshot.jpg "Screenshot")