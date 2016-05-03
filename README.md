# cronus
Schedules custom monitoring jobs and servers a [socket.io](http://socket.io/) connected monitoring website.


## Installation
```bash
git clone https://github.com/s-a/cronus.git
npm install
npm start
# node server/app.js --port 3000 --folder ./jobs
```

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
	return true;
};

module.exports = Job;
```