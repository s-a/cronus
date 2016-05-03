# cronus
![logo](/logo.png "logo")  
Schedules custom monitoring jobs and serves a [socket.io](http://socket.io/) connected monitoring website.


## Installation
```bash
$ git clone https://github.com/s-a/cronus.git;
$ cd cronus;
$ npm install;
```

## Develop and test monitoring script modules
```bash
$ node server/test.js --script jobs/1-minute.js;
```

## Start server
```bash
$ npm start;
# or
# $node server/app.js --port 3000 --folder ./jobs [--logFolder d:\logs];
```

## Cron patterns

```
* * * * * *
┬ ┬ ┬ ┬ ┬ ┬
│ │ │ │ │ |
│ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
│ │ │ │ └───── month (1 - 12)
│ │ │ └────────── day of month (1 - 31)
│ │ └─────────────── hour (0 - 23)
│ └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

Detailed description : [https://github.com/ncb000gt/node-cron](https://github.com/ncb000gt/node-cron)

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