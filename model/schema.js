'use strict'

var mongoose = require('mongoose');


var WaypointSchema = new mongoose.Schema({
  location: String
});

var YelpSchema = new mongoose.Schema({
  name: String,
  reviewInfo: Object, 
  phoneNumber: Number,
  location: Object,
  categories: Object,
  url: String,
  priceDescription: String
})

module.exports.WaypointSchema = mongoose.model('Waypoint', WaypointSchema);
module.exports.YelpSchema = mongoose.model('YelpResults', YelpSchema);