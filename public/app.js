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
    $scope.recommendModel = [];
    $scope.recommendationDisplayed = false;
    var yelpModel = [];
    var markerArr = [];
    var infoWindowArr = [];
    var icon = "./icons/marker.png";

    $scope.getYelpData = function(){
      $http({
        method: 'GET',
        url: "http://api.lyninx.com/showRecommendations"
      }).then(function(res){
        addMarkers(res);
      })
    }



    $scope.addWayPoint = function() {
      $scope.mapModel.push($scope.newWayPoint);
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

    var addMarkers = function(res){
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
            wayPtObj.price = "$150+";
          } else if (price === 'moderate') {
            wayPtObj.price = "$100-$150";
          } else {
            wayPtObj.price = "$50-$100";
          }

          yelpModel.push(wayPtObj);
          if ($scope.recommendationDisplayed === false) {
            $scope.recommendModel.push(wayPtObj);
          }

          var marker = new google.maps.Marker({
            position: {lat:wayPtObj.lat, lng: wayPtObj.lon },
            title: wayPtObj.name,
            map:map,
            icon: icon
          });

          google.maps.event.addListener(marker, 'click', attachInfoWindow(marker, yelpModel, j)); 
        }
        $scope.recommendationDisplayed = true;
    }

    var attachInfoWindow = function(mark,objModel,count) {
      return function(event) {
        var price = objModel[count].price;
        var addr = objModel[count].address;
        var rating = objModel[count].rating;
        var placeName = objModel[count].name;
        var contentStr = "<div class='infoWindow'> <h4> "+placeName + "</h4> Rating: " + rating + "<br> Price: " + price + "<br>" + addr +"</div>";
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

        markerArr.push(mark);
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
//////////////////////////////////////////////// Budget and Greedy Graph Algorithms below
  app.controller('BudgetCtrl', function($scope, $http, trip) {
    $scope.budget = trip.budget;
    $scope.totalCost = 0; 
    $scope.wayPoints = [];

    $scope.getWayPoints = function() {
      $http.get('/getWayPt')
      .then(function(res) {
        console.log(res);
      })
      .catch(function() {
        console.log("Can't connect to database");
      });
    };

  });

})()