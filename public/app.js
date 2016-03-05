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
      });

	  $locationProvider.html5Mode(true);
	});

  app.factory("trip",function(){
        return {};
  });

  app.service('wayptService', function($http) {
    return({
      addWayPt: addWayPt,
      getYelpData: getYelpData
    });

    function addWayPt(waypoint) {
      $http.post('/postWayPt', waypoint)
      .then(function() { console.log("Waypoint posted to server") })
      .catch(function() { console.log("Error, Waypoint not posted")} );
    }

    function getYelpData() {
      $http.get('/getYelpData')
      .then(function() { console.log("Got Yelp Data"); })
      .catch(function() { console.log("Error, No yelp data") });
    }

  });
//////////////////////////////////////////////////////////////////////////////////////
  app.controller('IndexCtrl', function($rootScope, $scope, $routeParams, $http, trip){
    $scope.trip = trip;
  });

  app.controller('MapSelectCtrl', function($scope, wayptService, trip) {
    $scope.trip = trip;
    var budget = $scope.trip.budget;

      initMap();
      function initMap() {
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map'), {
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
          if (checkboxArray.options[i].selected) {
            // maybe look for yelp data here
            wayptService.addWayPoint(checkboxArray[i].value);
            waypts.push({
              location: checkboxArray[i].value,
              stopover: true
            });
          }
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

    $scope.newWayPoint = "";
    $scope.mapModel = [];
    // name, location, rating and price
    $scope.yelpData = [];

    $scope.addWayPoint = function() {
      $scope.mapModel.push($scope.newWayPoint);
    };

  });
})()