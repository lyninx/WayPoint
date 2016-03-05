'use strict'

var mongoose = require('mongoose');


var WaypointSchema = new mongoose.Schema({
  location: String
});

module.exports = mongoose.model('Waypoint', WaypointSchema);