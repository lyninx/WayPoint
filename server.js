var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');
var sassMiddleware = require('node-sass-middleware');
var morgan = require('morgan');
var mongoose = require('mongoose');
var router = express.Router();
var db = require('./model/database.js')
var yelpSearch = require('./yelpSearch.js');

var app = express();
var api = express();

var port = 3000;
var api_port = 3001;


//////////////////////////////////////////////////////////////////
mongoose.connect('mongodb://admin:qhacks@ds060968.mlab.com:60968/tripninja', function(err){
    if(err) {
        console.log('db connection error', err);
    } else {
        console.log('db connection successful');
    }
});

app.use(sassMiddleware({
    src: __dirname + '/public/',
    dest: __dirname + '/public/css',
    debug: true,
    prefix: '/css',
    outputStyle: 'expanded'
}));

app.set('port', process.env.PORT || port);
app.use(morgan('dev')); // log every request to the console
app.use(express.static(__dirname + "/public"));
app.use('/*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
    
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', function(req,res) {
    res.sendfile("public/index.html");
});



api.set('port', api_port);
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));

//////////////////////////////////////////////////////////////////
api.get('/', function(req, res, next) {
	res.send("api works!");
});

api.post('/postWayPt', function(req,res) {
    console.log(req.body.location);
    var newWayPoint = req.body.location;
    console.log("database inserts " + newWayPoint);
    db.insertWaypoint(newWayPoint);
    res.send("waypoint added!");
});

api.get('/getWayPt', function(req,res) {
	console.log("fetching waypoints");
	var wayPoints = "";
    db.findWaypoints(function(docs) { 
    	
    	res.send(docs);
    	console.log(docs);
    	return
    });  
});

api.get('/results', function(req,res){
    console.log("Getting results...");
    db.findWaypoints(function(waypoints){
      // Also inserts found waypoints into database
    for (var i=0; i<waypoints.length; i++){
        var results = yelpSearch.findBusinesses("hotel", "hotels" , waypoints[i].location , 5000);  //returns information on hotels at location given by waypoints in database with a 5000m radius
        res.send(results);
      };
    })

    return
}); 

api.get('/showRecommendations', function(req, res){
    console.log("Showing results...");
    db.findYelpResults(function(results){
        res.send(results);
        console.log(results);
        return
    })
})


api.get('/clearWayPt', function(req,res) {
	console.log("clearing waypoints");
	var wayPoints = "";
    db.removeWaypoints(function(waypoints) { 
    	//console.log(waypoints);
    	res.send("cleared");
    });  
});




//////////////////////////////////////////////////////////////////
app.listen(port, function() {
    console.log('listening on port: '+ port);
});

api.listen(api_port, function(){
	console.log('api on port: '+ api_port);
});


