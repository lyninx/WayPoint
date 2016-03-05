var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');
var sassMiddleware = require('node-sass-middleware');
var morgan = require('morgan');
var mongoose = require('mongoose');
var db = require('./model/database.js')
var app = express();

var port = 3000;


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

app.post('/postWayPt', function(req,res) {
    console.log("here I am");
    var newWayPoint = req.body;
    console.log("database inserts " + newWayPoint);
    db.insertWaypoint(newWayPoint);
});

//////////////////////////////////////////////////////////////////
app.listen(port, function() {
    console.log('listening on port: '+ port);
});


