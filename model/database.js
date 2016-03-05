var mongoose = require("mongoose");


// SET UP DATABASE
var Waypoint = require("./schema.js");
var YelpResult = require("./schema.js");

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


// EXAMPLE=======

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

// EXAMPLE======

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


// EXAMPLE======

// removeWaypoints(function(waypoints){
// 	console.log(waypoints + " succesfully removed")
// })

var insertYelpResult = function(searchResult){
	var yelpResult = new YelpResult();

	yelpResult.name = searchResult.name;
	yelpResult.reviewInfo = searchResult.reviewInfo;
	yelpResult.phoneNumber = searchResult.phoneNumber;
	yelpResult.location = searchResult.location;
	yelpResult.categories = searchResult.categories;
	yelpResult.url = searchResult.url;
	yelpResult.priceDescription = searchResult.priceDescription;

	yelpResult.save(function(err, docs){
		if (err){
			throw err;
		}else{
			console.log(docs + " have been saved into database!")
		}
	})
}



module.exports.insertWaypoint = insertWaypoint;
module.exports.findWaypoints = findWaypoints;
module.exports.removeWaypoints = removeWaypoints;
module.exports.insertYelpResult = insertYelpResult;

