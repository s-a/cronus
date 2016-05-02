"use strict";
(function(io){
	var url = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
	var socket = io.connect(url);
	var x;
	socket.on("init", function (data) {
		var s = [];
		console.warn(data);
		for (var key in data.crons) {
			s.push(data.crons[key]);
		}

		console.log(s);
		render(s);
		document.getElementById("state").innerHTML = data.hello;
		//socket.emit("my other event", { my: "data" });
	});

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

	            // Create a new Service component for each item in the items array.
	            // Notice that I pass the self.addTotal function to the component.

	            return <Service name={s.name} description={s.description} price={s.price} active={s.active} addTotal={self.addTotal} />;
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
	        return  <p className={ this.state.active ? 'active' : '' } onClick={this.clickHandler}>
	                    {this.props.description} <b>{this.props.name}</b>
	                </p>;
	    }
	});



	var render = function (data) {
		x = ReactDOM.render(
		    <ServiceChooser items={ data } />,
		    document.getElementById('container')
		);
	}

})(io);
