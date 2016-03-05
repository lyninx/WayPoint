var mongoose = require('mongoose');

var ContentSchema = new mongoose.Schema({
  type: String,
  content: String
});

var ProjectSchema = new mongoose.Schema({
  category: String,
  title: String,
  description: String,
  image: String,
  main: [ContentSchema],
  date: { type: Date, default: Date.now},
});

module.exports = mongoose.model('pages', ProjectSchema);