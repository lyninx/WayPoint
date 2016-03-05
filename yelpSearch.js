var yelp = require("node-yelp");
 
 
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
var Business = function(name, reviewInfo, phoneNumber, location, categories, url){
  this.name = name;
  this.reviewInfo = reviewInfo;
  this.phoneNumber = phoneNumber;
  this.location = location;
  this.categories = categories;
  this.url = url;
}

showBusinesses = function(businesses){
  var businessArray = [];
  for(var i=0; i<businesses.length; i++){
    // get business information
    var name = businesses[i].name;
    var reviewInfo = {reviewCount: businesses[i].review_count, rating: businesses[i].rating};
    var phoneNumber = businesses[i].phone;
    var location = businesses[i].location;
    var categories = businesses[i].categories;
    var url = businesses[i].url;

    // create a new object with the search results and push into array
    var businessObject = new Business(name, reviewInfo, phoneNumber, location, categories, url)
    businessArray.push(businessObject);
  }
  // return info on top 5 search results
  return businessArray
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
    var businesses = data.businesses;
    var location = data.region;
    console.log(showBusinesses(businesses));
  
  }).catch(function (err) {
    if (err.type === yelp.errorTypes.areaTooLarge) {
      console.log("Area Too large")
    } else if (err.type === yelp.errorTypes.unavailableForLocation) {
      console.log("Unavailable for this location")
    }
  });
};
 


findBusinesses("hotel", "hotels" ,"M2M3Z9", 5000); //returns information on hotels at a postal code with a 5000m radius
findBusinesses("food", "food", "M2M3Z9", 2000); // returns information on food ...
