var express = require('express');
var cors = require('cors');
var router = express.Router();
var mongoose = require('mongoose');
var Page = require('./model/schema.js');
//var User = require('./model/user.js');

/* GET /api listing. */
router.all(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

router.use(cors());

router.get('/', cors(), function(req, res, next) {
  Page.find({}, 'category title date', function (err, pages) {
    if (err) return next(err);
    res.json(pages);
  });
});

// POST new document /
router.post('/', function(req, res, next) {
  Page.create(req.body, function (err, post) {
    if (err) return next(err);
    console.log(req.body);
    res.json(post);
  });
});

/* GET /api/title */
router.get('/:title', cors(), function(req, res, next) {
  Page.findOne({'title': req.params.title}, function (err, post) {
    if (err) return next(err);
    if (post != null){
      res.json(post);
    }
  });
});

router.get('/:title/content', cors(), function(req, res, next) {
  Page.findOne({'title': req.params.title}, function (err, post) {
    if (err) return next(err);
    if (post != null) {
      res.json(post.main);
      } 
  });
});

// DELETE /api/:id 
router.delete('/:id', function(req, res, next) {
  Page.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

router.post('/login', function(req, res, next) {
  Page.create(req.body, function (err, post) {
    if (err) return next(err);
    console.log(req.body);
    res.json(post);
  });
});

module.exports = router;