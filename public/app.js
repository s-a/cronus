"use strict";
(function(io){

	var render;
	var url = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
	var socket = io.connect(url);
	var x;
	var s = [];
	socket.on("init", function (data) {
		s = [];

		for (var key in data.crons) {
			if (data.crons.hasOwnProperty(key)) {
				s.push(data.crons[key]);
			}
		}
		render(s);
	});

	var jobDone = function (data) {
		var found = false;

 
		for (var i = 0; i < s.length; i++) {
			if (s[i].filename === data.job.filename){
				s[i] = data.job;
				found = true;
				break;
			}
		}
		if (!found){
			s.unshift(data.job);
		}
		x.setState({items:s});

		/*if (data.result !== true){
			var $body = $("body");
			setInterval(function(){
				document.title = (document.title === original) ? "MONITOR ERROR" : original;

			}, 1000);
		}*/
	};

	var jobDoneErr = function (data) {
		console.error(data);
		jobDone(data);
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
	            return <Service prettyCron={s.prettyCron} cronPattern={s.cronPattern} log={s.log} lastStart={s.lastStart} name={s.name} description={s.description} price={s.price} active={s.active} addTotal={self.addTotal} />;
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
	        var self = this;
	        var items = this.props.items || [];

	        var logitems = items.map(function(s){
	            return <i title={"Started: " + moment(s.date).calendar()} className={"fa " + (s.err ? "fa-exclamation-triangle" : "fa-check-square") + " state-err-" + s.err} aria-hidden="true"></i>;
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
		        		<div className={ "row " + (this.state.active ? 'active' : '') } onClick={this.clickHandler}>
		        			<div className="col-md-6">
		                    	<i className={"job-icon " + (this.props.iconCssClassName ? this.props.iconCssClassName : "fa fa-signal")} aria-hidden="true"></i> 
			                    {this.props.description} 
		        			</div>
		        			<div className="col-md-5">
			                    <code>"{this.props.cronPattern}"</code> | lastStart: {moment(this.props.lastStart).calendar()}  
		        			</div>
		        			<div className="col-md-1">
		                    	<b>{this.props.name}</b> 
		        			</div>
		                </div>
                    	<ServiceLog lastStart={"Last start: " + moment(this.props.lastStart).calendar()} items={this.props.log} />
		                
	                </div>;
	    }
	});


	render = function (data) {
		x = ReactDOM.render(
		    <ServiceChooser items={ data } />,
		    document.getElementById('container')
		);
	}

})(io);
