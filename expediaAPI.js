var request = require('request');
var mongoose = require('mongoose');

var apiKey = "EzHG8PETQubneAhbPUW7HmjAGKsEbqOA";
var waypoint = "";

var FunActivity = function(name, price, latLng, category, rating) {
	this.name = name;
	this.price = price;
	this.latLng = latLng;
	this.category = category;
	this.rating = rating;
}	

var sendAPICall(waypoint,apiKey) {
	
}