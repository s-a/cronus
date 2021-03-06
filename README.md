# cronus
![logo](/logo.png "logo")  
Schedules custom monitoring jobs and serves a [socket.io](http://socket.io/) connected monitoring website.


[![NPM Version](http://img.shields.io/npm/v/sa-cronus.svg)](https://www.npmjs.org/package/sa-cronus)
[![Build Status](https://travis-ci.org/s-a/cronus.svg)](https://travis-ci.org/s-a/cronus)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/af86e9dc06cc43d3947fae9ad343219a)](https://www.codacy.com/app/stephanahlf/cronus?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=s-a/cronus&amp;utm_campaign=Badge_Grade)
[![Dependency Status](https://david-dm.org/s-a/cronus.svg)](https://david-dm.org/s-a/cronus)
[![devDependency Status](https://david-dm.org/s-a/cronus/dev-status.svg)](https://david-dm.org/s-a/cronus#info=devDependencies)
[![NPM Downloads](https://img.shields.io/npm/dm/sa-cronus.svg)](https://www.npmjs.org/package/sa-cronus)
[![Massachusetts Institute of Technology (MIT)](https://s-a.github.io/license/img/mit.svg)](/LICENSE.md#mit)
[![Donate](http://s-a.github.io/donate/donate.svg)](http://s-a.github.io/donate/)

## Demo
![demo](/demo.gif "demo")

## Installation
```bash
$ npm i -g sa-cronus;
```

## Develop and test monitoring script modules
```bash
$ node server/test.js --script jobs/1-minute.js;
```

## Start server
```bash
$ sa-cronus [--port 3000] --folder ./jobs [--logFolder d:\logs];
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

## Example sync monitor job
```javascript
"use strict";

var Job = function() {
	this.cronPattern = "* * * * * *";
	this.name = "unicorn ONE";
	this.description = "You will see this message every second";
	this.iconCssClassName = "fa fa-database";

	return this;
};


Job.prototype.test = function(/*controller*/) {
	return false;
};

module.exports = Job;
```

## Example async monitor job
```javascript
"use strict";

var Job = function() {
	this.cronPattern = "*/20 * * * * *";
	this.name = "unicorn timeout";
	this.description = "20-seconds rotating timeout";
	this.iconCssClassName = "fa fa-calendar-times-o";
	this.shouldTimeout = false;
	return this;
};


Job.prototype.testAsync = function(controller, done) {
	var time = 2000;
	if (this.shouldTimeout){
		time = 6000;
	}
	this.shouldTimeout = !this.shouldTimeout;

	setTimeout(function () {
		done(true);
	}, time);
	//return true;
};

module.exports = Job;
```
More example jobs can be found at [/jobs/](/jobs/).  

