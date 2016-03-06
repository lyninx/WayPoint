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
//////////////////////////////////////////////////////////////////////////////////////
  app.controller('IndexCtrl', function($rootScope, $scope, $routeParams, $http, trip){
    $scope.trip = trip;


  });

  app.controller('MapSelectCtrl', function($scope, $http, trip) {
    $scope.trip = trip;
    $scope.newWayPoint = "";
    $scope.mapModel = [];
    var yelpModel = [];
    var markerArr = [];
    var icon = "./icons/marker.png";

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
      }).success(function () {});
    };

    $scope.getYelpData = function() {
      console.log("pressed")
      $http.get('http://api.lyninx.com/showRecommendations')
      .then(function(res) {
        
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

          yelpModel.push(wayPtObj);

          var contentString = "<div id='content'> <h2>"+wayPtObj.name+"</h2></div>";

          var infoWindow = new google.maps.InfoWindow({
            content:contentString
          }); 

          var marker = new google.maps.Marker({
            position: {lat:wayPtObj.lat, lng: wayPtObj.lon },
            title: wayPtObj.name,
            map:map,
            icon: icon
          });

          marker.addListener('click', function() {
            infoWindow.open(map,marker);
          });

          markerArr.push(marker);
        }

      });
    };

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

            for (var index = 0; index < markerArr.length;index++) {
              markerArr[index].setMap(map);
            }

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

    
    var callbackFunction = function(){
      $http.get('http://api.lyninx.com/showRecommendations')
      .then(function(res) {
        console.log("got a response");
        console.log(res);
        if(res.data.length <= ($scope.mapModel.length*5-1)){
          return callbackFunction()
        }else{
          $http.get("http://api.lyninx.com/clearWayPt")
          .then(function(res){
            console.log("cleared waypoints");
          })
        }
      }); 
    };

 
  });
})()