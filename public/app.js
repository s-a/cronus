"use strict";

(function(io, moment, React, ReactDOM, $){
	var render;
	var url = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
	var socket = io.connect(url);
	var x;
	var s = [];

    socket.on("disconnect", function(){
		$("#loading").show();
		$("#connected").hide();
		$("#server-start-time").text("?");
    });

	socket.on("init", function (data) {

		$("#loading").hide();
		$("#connected").show();
		$("#version").text(data.package.version);
		$("#server-start-time").text(moment(data.serverStartTime).calendar());
		s = [];

		for (var key in data.crons) {
			if (data.crons.hasOwnProperty(key)) {
				s.push(data.crons[key]);
			}
		}
		render(s);
	});

	socket.on("removed", function (data) {
		for (var key in data.crons) {
			if (data.crons.hasOwnProperty(key)) {
				s.push(data.crons[key]);
			}
		}
		render(s);
	});

	var updateJobByFilename = function (data) {
		var found = false;
		for (var i = 0; i < s.length; i++) {
			if (s[i].filename === data.job.filename){
				s[i] = data.job;
				found = true;
				break;
			}
		}
		return found;
	};

	var updateJobViewModel = function (data) {
		var found = updateJobByFilename(data);
		if (!found){
			s.unshift(data.job);
		}
		x.setState({items:s});
	};

	var jobDone = function (data) {
		if (data.job){
			updateJobViewModel(data);
		}
	};

	var removeJob = function (path) {
		for (var i = 0; i < s.length; i++) {
			var job = s[i];
			if (job.filename === path){
				s.splice(i, 1);
				x.setState({items:s});
				break;
			}
		}
	};

	var jobDoneErr = function (data) {
		console.error(data);

		if (data.exception){
			if(data.exception.errno === -4058){
				removeJob(data.exception.path);
			}
		} else {
			jobDone(data);
		}
	};

	socket.on("job-done", jobDone);
	socket.on("error", jobDoneErr);
	
	var ServiceChooser = React.createClass({
		getInitialState: function(){
			return { };
		},
		render: function() {
			var self = this;
			var services = this.props.items.map(function(s){
				/* eslint-disable */	
				return <Service iconCssClassName={s.iconCssClassName} prettyCron={s.prettyCron} cronPattern={s.cronPattern} log={s.log} lastStart={s.lastStart} name={s.name} description={s.description} active={s.active} />;
				/* eslint-enable */
			});
			return <div>
				<div id="services">
					{services}
				</div>
			</div>;
		}
	});

	var ServiceLog = React.createClass({
		render: function() {
			
			var items = this.props.items || [];

			var logitems = items.map(function(s, e){
				var title = "Started: " + moment(s.date).calendar();
				var icon = "fa-question-circle";
				if (s.exception){
					icon = "fa-calendar-times-o";
					title += " timed out!";
				} else {
					if (s.err === true){
						icon = "fa-exclamation-triangle";
					}
					if (s.err === false){
						icon = "fa-check-square";
					}
					if (s.err === null){
						icon = "fa-clock-o";
					}
					if (s.err === undefined){
						icon = "fa-hourglass-start";
					}
				}

				return <span><i title={title} className={"fa " + icon + " state-err-" + s.err} aria-hidden="true"></i> <span className="log-date-text hidden-xs hidden-sm" title={"Started: " + moment(s.date).calendar()}>{moment(s.date).calendar()}</span></span>;
			});

			return <div className="row">
				<div className="col-md-12 ellipsed">
					{logitems}
				</div>
			</div>;

		}
	});


	var Service = React.createClass({
		getInitialState: function(){
			return { active: false };
		},
		clickHandler: function (){
			var active = !this.state.active;
			this.setState({ active: active });
			// Notify the ServiceChooser, by calling its addTotal method
			this.props.addTotal( active ? this.props.price : -this.props.price );
		},
		render: function(){
			return <div className="container paper-shadow-top-z-2 card" title={this.props.prettyCron}>
						<div className={ "row " + (this.state.active ? "active" : "") } onClick={this.clickHandler}>
							<div className="col-md-6">
								<i className={"job-icon " + (this.props.iconCssClassName ? this.props.iconCssClassName : "fa fa-signal")} aria-hidden="true"></i>
								<strong>{this.props.description}</strong>
							</div>
							<div className="col-md-5">
								<code>"{this.props.cronPattern}"</code> | lastStart: {moment(this.props.lastStart).calendar()}
							</div>
							<div className="col-md-1">
								<b>{this.props.name}</b>
							</div>
						</div>
						<ServiceLog lastStart={"Last start: " + moment(this.props.lastStart).calendar()} items={this.props.log}  />

					</div>;
		}
	});


	render = function (data) {
		x = ReactDOM.render(
			<ServiceChooser items={ data } />,
			document.getElementById("container")
		);
	};
})(window.io, window.moment, window.React, window.ReactDOM, window.jQuery);