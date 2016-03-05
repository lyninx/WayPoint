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


var findBusinesses = function(terms, postalCode){
  client.search({
    terms: terms,
    location: postalCode,
    limit: 2,
    sort: 0,
    radius_filter: 2000
  }).then(function (data) {
    var businesses = data.businesses;
    var location = data.region;
    console.log(businesses);
  
  }).catch(function (err) {
    if (err.type === yelp.errorTypes.areaTooLarge) {
      console.log("Area Too large")
    } else if (err.type === yelp.errorTypes.unavailableForLocation) {
      console.log("Unavailable for this location")
    }
  });
};
 
client.business("grand-place-bruxelles-2", {
  cc: "US"
}).then(function (data) {
  // ... 
});

findBusinesses("Food", "M2M3Z9");