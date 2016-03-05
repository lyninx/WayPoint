var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors');
var sassMiddleware = require('node-sass-middleware');
var morgan = require('morgan');
var router = require('./router.js');
var mongoose = require('mongoose');
var app = express();
var api = express();
var admin = express();

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

api.set('port', api_port);
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
api.use(cors());
api.use(router);

app.set('port', process.env.PORT || port);
app.use(morgan('dev')); // log every request to the console
app.use(express.static(__dirname + "/public"));
app.use('/*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

//////////////////////////////////////////////////////////////////
app.listen(port, function() {
    console.log('listening on port: '+ port);
});
api.listen(api_port, function(){
	console.log('api on port: '+ api_port);
});
