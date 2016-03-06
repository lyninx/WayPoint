var request = require('request');

var funActivityKey = "EzHG8PETQubneAhbPUW7HmjAGKsEbqOA";
var hotelSearchKey = "1exNldWCGAnYS1MPKjja0GBlL6EuiL3C";

var FunActivity = function(name, price, lat, lng, category, recommendationScore) {
	this.name = name;
	this.price = price;
	this.lat = lat;
	this.lng = lng;
	this.category = category;
	this.rating = recommendationScore;
}	

var sendFunActivityAPICall = function(location) {
	var url = "http://terminal2.expedia.com/x/activities/search?location=" + location + "&apikey=" + funActivityKey;
	request(url, function(err, res) {
		
		if (!err && res.statusCode === 200) {
			var activities = new Array();

			for (var j = 0; j < res.body.activities.length; j++) {
				
				var name = res.body.activities[j].title;
				var price = res.body.activities[j].fromPrice;
				var latLng = res.body.activities[j].latLng;
				latLng = latLng.split(",");
				var lat = latLng[0];
				var lng = latLng[1];
				var category = res.body.activities[j].categories[1] || res.body.activities[j].categories[0];
				var rating = res.body.activities[j].recommendationScore;
				var activity = new FunActivity(name, price, lat, lng, category, rating);
				
				activities.push(activity);
			}

			return activities; 
		} else {
			throw err;
		}
	});
}

var Hotel = function(name, baseRate, guestRating, lat, lng, address, city, country) {
	this.name = name;
	this.rating = guestRating;
	this.rate = baseRate;
	this.lat = lat;
	this.lng = lng;
	this.addr = address;
	this.city = city;
	this.country = country;
}

var getHotelInfoAPICall = function(lat,lng) {
	var url = "http://terminal2.expedia.com/x/hotels?location=" + lat + "," + lng + "&radius=5km&dates=2016-05-19,2016-05-22&apikey=" + hotelSearchKey;
	request(url, function(err,res) {

		if (!err && res.statusCode === 200) {
			
			var hotels = new Array();
			for (var i = 0; i < res.body.HotelCount; i++) {
				var title = res.body.HotelInfoList.HotelInfo[i].Name;
				var price = res.body.HotelInfoList.HotelInfo[i].Price.BaseRate.Value;
				var rating = res.body.HotelInfoList.HotelInfo[i].GuestRating;
				var lat = res.body.HotelInfoList.HotelInfo[i].Location.GeoLocation.Latitude;
				var lng = res.body.HotelInfoList.HotelInfo[i].Location.GeoLocation.Longitude;
				var addr = res.body.HotelInfoList.HotelInfo[i].Location.StreetAddress;
				var city = res.body.HotelInfoList.HotelInfo[i].Location.City;
				var country = res.body.HotelInfoList.HotelInfo[i].Location.Country;
				var hotel = new Hotel(title,price,rating,lat,lng,addr,city,country);
				hotels.push(hotel);
			}

			return hotels;

		} else {
			throw err;
		}
	});
}

