var yelp = require("node-yelp");
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require('mongoose');

var Model = require('./model/schema.js');
var DB = require('./model/database.js');
 
var client = yelp.createClient({
  oauth: {
    "consumer_key": "grxQo8l5mQF_NuLUh_C2fg",
    "consumer_secret": "nGiDOS3Yt8DSwamLi94t0oLPB8I",
    "token": "f7kccP5HOR22vpVNiMk6VelLYJC6qJsv",
    "token_secret": "qQAvJano6t5kPhpCtmxKRxkD-zY"
  },
  
  // Optional settings: 
  httpClient: {
    maxSockets: 25  // ~> Default is 10 
  }
});

// create constructor for business
var Business = function(name, reviewInfo, phoneNumber, location, categories, url, priceDescription){
  this.name = name;
  this.reviewInfo = reviewInfo;
  this.phoneNumber = phoneNumber;
  this.location = location;
  this.categories = categories;
  this.url = url;
  this.priceDescription = priceDescription;
}


// Create web scraper to get yelp prices
var getPriceInfo = function(businessObject, url){
  request(url, function (err, res, html) {
    if (!err && res.statusCode == 200) {
      var $ = cheerio.load(html); 
      var priceDescription = $('.price-description').text();
      businessObject.priceDescription = priceDescription;
      // Do stuff with the data...
      DB.insertYelpResult(businessObject);
    }else{
      throw err
    }
  });
}



showBusinesses = function(businesses, callback){
  var businessArray = [];
  for(var i=0; i<businesses.length; i++){
    // get business information
    var name = businesses[i].name;
    var reviewInfo = {reviewCount: businesses[i].review_count, rating: businesses[i].rating};
    var phoneNumber = businesses[i].phone;
    var location = businesses[i].location;
    var categories = businesses[i].categories;
    var url = businesses[i].url;

    // get prices and then create new object with prices included 
    var businessObject = new Business(name, reviewInfo, phoneNumber, location, categories, url);
    callback(businessObject , url);
  }
}


var findBusinesses = function(terms, categoryFilter ,postalCode, radiusFilter){
  client.search({
    terms: terms,
    location: postalCode,
    limit: 5,
    sort: 0,
    radius_filter: radiusFilter,
    category_filter: categoryFilter
  }).then(function (data) {
    // this is where the data gets processed
    var businesses = data.businesses;
    showBusinesses(businesses, getPriceInfo);
  
  }).catch(function (err) {
    if (err.type === yelp.errorTypes.areaTooLarge) {
      console.log("Area Too large")
    } else if (err.type === yelp.errorTypes.unavailableForLocation) {
      console.log("Unavailable for this location")
    }
  });
};
 

// DB.findWaypoints(function(waypoints){
//   // Also inserts found waypoints into database
//   for (var i=0; i<waypoints.length; i++){
//     findBusinesses("hotel", "hotels" , waypoints[0].location , 5000);  //returns information on hotels at location given by waypoints in database with a 5000m radius
//   };
// })


// findBusinesses("food", "food", "M2M3Z9", 2000); // returns information on food ...
