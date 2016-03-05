var mongoose = require("mongoose");


// SET UP DATABASE
var Waypoint = require("./schema.js");
var dbURI = "mongodb://admin:qhacks@ds060968.mlab.com:60968/tripninja"

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + dbURI);
}); 

mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});


// inserts a waypoint location from map into database
var insertWaypoint = function(location){
	var newWaypoint = new Waypoint();
	newWaypoint.location = location;

	newWaypoint.save(function(err, docs){
		if (err){
			throw err
		}else{
			console.log(docs + " has been inserted into the database!")
		}
	})
}

// insertWaypoint("Toronto");

var findWaypoints = function(callback){
	Waypoint.find({}, function(err, docs){
		if (err){
			throw err
		}else{
			callback(docs);
		}
	})
};

// findWaypoints(function(waypoints){
// 	console.log("Here are the waypoints saved: \n\n" + waypoints);
// 	// do something with the waypoints
// });

var removeWaypoints = function(callback){
	Waypoint.remove({}, function(err, docs){
		if (err) {
			throw err
		}else{
			callback(docs);
		}
	})
}

// removeWaypoints(function(waypoints){
// 	console.log(waypoints + " succesfully removed")
// })

