(function(){
  var app = angular.module('qhacks',['ui.router', 'ngRoute']);

  app.config(function ($routeProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "login.html",
        controller: "IndexCtrl"
      })
      .when("/map", {
        templateUrl: "map.html",
        controller: "IndexCtrl"
      })
      .when("/budget", {
        templateUrl: "budget.html",
        controller: "IndexCtrl"
      });

    $locationProvider.html5Mode(true);
  });

  app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
  });

  app.factory("trip",function(){
        return {};
  });
//////////////////////////////////////////////////////////////////////////////////////
  app.controller('IndexCtrl', function($rootScope, $scope, $routeParams, $http, trip){
    $scope.trip = trip;


  });

  app.controller('MapSelectCtrl', function($scope, $http, trip) {
    $scope.trip = trip;
    $scope.newWayPoint = "";
    $scope.mapModel = [];
    $scope.recommendHotelModel= [];
    $scope.recommendationDisplayed = false;
    var yelpModel = [];
    var hotelModel = [];
    var activityModel = [];
    var infoWindowArr = [];
    var hotelIcon = "./icons/hotel.png";
    var activityIcon = "./icons/marker.png";

    $scope.getYelpData = function(){
      $http({
        method: 'GET',
        url: "http://api.lyninx.com/showRecommendations"
      }).then(function(res){
        addMarkersForYelp(res);
      })
    }

    $scope.addWayPoint = function() {
      $scope.mapModel.push($scope.newWayPoint);
      sendFunActivityAPICall($scope.newWayPoint);
      $http({
          method: 'POST',
          url: 'http://api.lyninx.com/postWayPt',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          transformRequest: function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
          },
          data: {location: $scope.newWayPoint}
      })
    };

    var sendFunActivityAPICall = function(location) {
      var url = "http://terminal2.expedia.com/x/activities/search?location=" + location + "&apikey=EzHG8PETQubneAhbPUW7HmjAGKsEbqOA";
      $http.get(url)
      .then(function(res) {
        console.log("Connected to Expedia...");
        getHotelInfoAPICall(res.data.regionId);
        var activities = new Array();
        for (var j = 0; j < res.data.activities.length; j++) {
        
          var name = res.data.activities[j].title;
          var price = res.data.activities[j].fromPrice;
          var latLng = res.data.activities[j].latLng;
          latLng = latLng.split(",");
          var lat = latLng[0];
          var lng = latLng[1];
          var category = res.data.activities[j].categories[1] || res.data.activities[j].categories[0];
          var rating = res.data.activities[j].recommendationScore;
          var activity = {
            name: name,
            price: price,
            lat: lat,
            lng: lng,
            category: category,
            rating : rating
          }
          activityModel.push(activity);
          addMarkerForActivity(activity,j);
        }
      })
      .catch(function() {
        console.log("Can not connect to Expedia");
      });
    };

   /* var getLatLng = function(location) {
      var url = "https://maps.googleapis.com/maps/api/geocode/json?&address=" + location;
      $http.get(url)
      .then(function(res) {
        console.log(res);
        var latLng = res.data.results[0].geometry.location;
      })
      .catch(function() {
        console.log("Error with geocoding");
      })
    };*/

   var getHotelInfoAPICall = function(regionID) {
      var url = "http://terminal2.expedia.com/x/hotels?maxhotels=10&regionids="+ regionID +"&radius=0.1km&dates=2016-05-19,2016-05-22&apikey=1exNldWCGAnYS1MPKjja0GBlL6EuiL3C";
      $http.get(url)
      .then(function(res) {
        console.log("Connected to Expedia...");
        for (var i = 0; i < res.data.HotelCount; i++) {
          var title = res.data.HotelInfoList.HotelInfo[i].Name;
          var price = res.data.HotelInfoList.HotelInfo[i].Price.BaseRate["Value"];
          var rating = res.data.HotelInfoList.HotelInfo[i].GuestRating;
          var lat = res.data.HotelInfoList.HotelInfo[i].Location.GeoLocation.Latitude;
          var lng = res.data.HotelInfoList.HotelInfo[i].Location.GeoLocation.Longitude;
          var addr = res.data.HotelInfoList.HotelInfo[i].Location.StreetAddress;
          var hotel = {
            name: title,
            price: price,
            rating:rating,
            lat:lat,
            lng:lng,
            address:addr,
          }
          hotelModel.push(hotel);
          addMarkerForHotel(hotel, i);
        } 

      })
      .catch(function(){
        console.log("Can not connect to Expedia");
      });
    };

    var addMarkerForHotel = function(hotel, count) {
      var marker = new google.maps.Marker({
        position: {lat: parseInt(hotel.lat),lng: parseInt(hotel.lng)},
        map:map,
        icon: hotelIcon
      });
      google.maps.event.addListener(marker,'click', attachInfoWindow(marker,hotelModel,count));
      $scope.recommendHotelModel.push(hotel);
    };

    var addMarkerForActivity = function(activity, count) {
      var marker = new google.maps.Marker({
        position: {lat:parseInt(activity.lat),lng:parseInt(activity.lng)},
        map:map,
        icon: activityIcon
      });
      google.maps.event.addListener(marker, 'click', attachInfoWindow(marker,activityModel,count));
    };

    var addMarkersForYelp = function(res){
      for (var j = 0; j < res.data.length; j++) {
        var resIndex = res.data[j];

          var wayPtObj = {
            price: resIndex.priceDescription,
            category: resIndex.categories[0][0],
            address: resIndex.location.address[0],
            lat: resIndex.location.coordinate.latitude,
            lon: resIndex.location.coordinate.longitude,
            rating: resIndex.reviewInfo.rating,
            name: resIndex.name
          };

         var price = wayPtObj.price.toString().toLowerCase();
          if (price === 'pricey') {
            wayPtObj.price = "$150";
          } else if (price === 'moderate') {
            wayPtObj.price = "$100";
          } else {
            wayPtObj.price = "$50";
          }

          yelpModel.push(wayPtObj);
          if ($scope.recommendationDisplayed === false) {
            $scope.recommendHotelModel.push(wayPtObj);
          }

          var marker = new google.maps.Marker({
            position: {lat:wayPtObj.lat, lng: wayPtObj.lon },
            title: wayPtObj.name,
            map:map,
            icon: hotelIcon
          });

          google.maps.event.addListener(marker, 'click', attachInfoWindow(marker, yelpModel, j)); 
        }
        $scope.recommendationDisplayed = true;
    }

    var attachInfoWindow = function(mark,objModel,count) {
      return function(event) {
        var price = objModel[count].price;
        var rating = objModel[count].rating;
        var category = objModel[count].category;
        var placeName = objModel[count].name;
        var contentStr = "<div class='infoWindow'> <h4> "+placeName + "</h4> Rating: " + rating + "<br> Price: " + price + "<br> Category: " + category + "</div>";
        var markerInfo = new google.maps.InfoWindow({
          maxWidth:600
        });
        markerInfo.setContent(contentStr);
        markerInfo.setPosition(event.latLng);
        markerInfo.open(map);
        infoWindowArr.push(markerInfo);

        // closes previous infowindow if there is another
        if (infoWindowArr.length > 1) {
            infoWindowArr[0].close();
            infoWindowArr[0] = infoWindowArr[1];
            infoWindowArr.pop();
        }

        google.maps.event.addListener(map, 'click', function() {
          markerInfo.close();
        });
      };
    }

      initMap();
      function initMap() {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 6,
          center: {lat: 41.85, lng: -87.65}
        });
        directionsDisplay.setMap(map);
        
        document.getElementById('submit').addEventListener('click', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay);
        });
      }

      function calculateAndDisplayRoute(directionsService, directionsDisplay) {
        var waypts = [];
        var checkboxArray = document.getElementById('waypoints');
        for (var i = 0; i < checkboxArray.length; i++) {
            waypts.push({
              location: checkboxArray[i].value,
              stopover: true
            });
        }
        var selectedMode = document.getElementById('mode').value;
        directionsService.route({
          origin: $scope.trip.origin,
          destination: document.getElementById('end').value,
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode[selectedMode]
        }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            var route = response.routes[0];
            var summaryPanel = document.getElementById('directions-panel');
            summaryPanel.innerHTML = '';
            // For each route, display summary information.
            for (var i = 0; i < route.legs.length; i++) {
              var routeSegment = i + 1;
              summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
                  '</b><br>';
              summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
              summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
              summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
            }
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
      }
  });

/////////////////////////////////////////////// Graph and Budget Algorithms

  app.controller('BudgetCtrl', function($http, $scope, trip) {
    $scope.budget = trip.budget;
    $scope.totalCost = 0;
    $scope.waypoints = [];
    $scope.funActivities = [];
    $scope.latLngs = [];
    $scope.hotels = [];
    $scope.decisions = [];

    $scope.getWayPoints = function() {
      $http.get('http://api.lyninx.com/getWayPt')
      .then(function(res) {
        for (var i = 0; i < res.data.length; i++) {
          var wayPt = res.data[i].location;
          $scope.waypoints.push(wayPt);
        }
      })
      .catch(function() {
        console.log("Can't connect to database");
      });
    };

    var getLatLng = function(location) {
      var url = "https://maps.googleapis.com/maps/api/geocode/json?&address=" + location;
      $http.get(url)
      .then(function(res) {
        var latLng = res.data.results.geometry.location;
        $scope.latLngs.push(latLng);
      })
      .catch(function() {
        console.log("Error with geocoding");
      })
    };

    var sendFunActivityAPICall = function(location) {
      var url = "http://terminal2.expedia.com/x/activities/search?location=" + location + "&apikey=EzHG8PETQubneAhbPUW7HmjAGKsEbqOA";
      $http.get(url)
      .then(function(res) {
        console.log("Connected to Expedia...");
        var activities = new Array();
        for (var j = 0; j < res.data.activities.length; j++) {
        
          var name = res.data.activities[j].title;
          var price = res.data.activities[j].fromPrice;
          var latLng = res.data.activities[j].latLng;
          latLng = latLng.split(",");
          var lat = latLng[0];
          var lng = latLng[1];
          var category = res.data.activities[j].categories[1] || res.data.activities[j].categories[0];
          var rating = res.data.activities[j].recommendationScore;
          var activity = {
            name: name,
            price: price,
            lat: lat,
            lng: lng,
            category: category,
            rating : rating
          }

          activities.push(activity);
        }
          var locationActivity = {
            loc : location,
            act : activities
          }
          $scope.funActivities.push(locationActivity);
      })
      .catch(function() {
        console.log("Can not connect to Expedia");
      });
    };

    var getHotelInfoAPICall = function(lat,lng) {
      var url = "http://terminal2.expedia.com/x/hotels?location=" + lat + "," + lng + "&radius=5km&dates=2016-05-19,2016-05-22&apikey=1exNldWCGAnYS1MPKjja0GBlL6EuiL3C";
      $http.get(url)
      .then(function(res) {
        console.log("Connected to Expedia...");

        for (var i = 0; i < res.data.HotelCount; i++) {
          var title = res.data.HotelInfoList.HotelInfo[i].Name;
          var price = res.data.HotelInfoList.HotelInfo[i].Price.BaseRate.Value;
          var rating = res.data.HotelInfoList.HotelInfo[i].GuestRating;
          var lat = res.data.HotelInfoList.HotelInfo[i].Location.GeoLocation.Latitude;
          var lng = res.data.HotelInfoList.HotelInfo[i].Location.GeoLocation.Longitude;
          var addr = res.data.HotelInfoList.HotelInfo[i].Location.StreetAddress;
          var hotel = {
            name: title,
            price: price,
            rating:rating,
            lat:lat,
            lng:lng,
            address:addr,
          }
          $scope.hotels.push(hotel);
      }

      })
      .catch(function(){
        console.log("Can not connect to Expedia");
      });
    };

    $scope.calculateBudget = function() {
      for (var index = 0; index < $scope.waypoints.length; index++) {
        getLatLng($scope.waypoints[index]);
        sendFunActivityAPICall($scope.waypoints[index]);
      }
      for (var i = 0; i < $scope.latLngs.length; i++) {
        getHotelInfoAPICall($scope.latLngs[i].lat,$scope.latLngs[i].lng);
      }

     };    

  });

})()