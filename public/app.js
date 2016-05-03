"use strict";
(function(io){
	var url = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
	var socket = io.connect(url);
	var x;
	var s = [];
	socket.on("init", function (data) {
		s = [];

		for (var key in data.crons) {
			s.push(data.crons[key]);
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
			s.push(data.job);
		}
		x.setState({items:s});
	};

	var jobDoneErr = function (data) {
		console.error(data);
		jobDone(data);
	};

	socket.on("job-done", jobDone);
	socket.on("error", jobDoneErr);



	var ServiceChooser = React.createClass({
	    getInitialState: function(){
	        return { total: 0 };
	    },
	    addTotal: function( price ){
	        this.setState( { total: this.state.total + price } );
	    },
	    render: function() {
	        var self = this;
	        var services = this.props.items.map(function(s){
	            return <Service cronPattern={s.cronPattern} log={s.log} lastStart={s.lastStart} name={s.name} description={s.description} price={s.price} active={s.active} addTotal={self.addTotal} />;
	        });
	        return <div>
	                    <h1>Our services</h1>
	                    <div id="services">
	                        {services}
	                        <p id="total">Total <b></b></p>
	                    </div>
	                </div>;
	    }
	});

	var ServiceLog = React.createClass({

	   
	    render: function() {
	        var self = this;
	        var items = this.props.items || [];

	        var logitems = items.map(function(s){
	            return <i title={"Last start: " + moment(s.date).calendar()} className={"fa " + (s.err ? "fa-exclamation-triangle" : "fa-check-square") + " state-err-" + s.err} aria-hidden="true"></i>;
	        });

	        return <div>{this.props.lastStart}<ol>
	        			{logitems}
	               	</ol></div>;

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
	        return  <div className={ this.state.active ? 'active' : '' } onClick={this.clickHandler}>
	                    {this.props.description} <i>({this.props.cronPattern})</i> <b>{this.props.name}</b> 
                    	<ServiceLog lastStart={"Last start: " + moment(this.props.lastStart).calendar()} items={this.props.log} />
	                </div>;
	    }
	});



	var render = function (data) {
		x = ReactDOM.render(
		    <ServiceChooser items={ data } />,
		    document.getElementById('container')
		);
	}

})(io);
