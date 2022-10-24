# cronus
![logo](/logo.png "logo")  
Schedules custom monitoring jobs and serves a [socket.io](http://socket.io/) connected monitoring website.


[![NPM Version](http://img.shields.io/npm/v/sa-cronus.svg)](https://www.npmjs.org/package/sa-cronus)
[![Build Status](https://travis-ci.org/s-a/cronus.svg)](https://travis-ci.org/s-a/cronus)
[![NPM Downloads](https://img.shields.io/npm/dm/sa-cronus.svg)](https://www.npmjs.org/package/sa-cronus)
[![Massachusetts Institute of Technology (MIT)](https://s-a.github.io/license/img/mit.svg)](/LICENSE.md#mit)
[![Donate](http://s-a.github.io/donate/donate.svg)](http://s-a.github.io/donate/)

## Demo
![demo](/demo.gif "demo")

## Installation standalone

```bash
$ npm i -g sa-cronus;
```

## Start server
```bash
$ sa-cronus [--port 3000] --folder ./jobs [--logFolder d:\logs];
```

## Installation module

```bash
$ npm i sa-cronus;
```

## Usage programmatically

```javascript
#!/usr/bin/env node

const minimist = require('minimist')
const CronusServer = require('sa-cronus')

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

## Changelog

### V1.0.0

- Migrate to Twitter Bootstrap 5

#### Breaking changes

- `job.testAsync` is obsolete use `async job.verify` instead
- `job.shouldTimeout` `bool` is obsolete use `job.timeout` `int` instead
- `job.timout` is now optional but recommended

## Example promise monitor job

```javascript

var Job = function () {
	this.cronPattern = "*/2 * * * * *";
	this.name = "async";
	this.iconCssClassName = "fa fa-calendar-times-o";
	this.timeout = 100000
	this.description = "You will see this message every 2 seconds";

	return this;
};


Job.prototype.verify = async function (controller) {
	controller.log.warn("invoke async test function")
	return true;
};

module.exports = Job;
```


More example jobs can be found at [/jobs/](/jobs/).