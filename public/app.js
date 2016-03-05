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


//////////////////////////////////////////////////////////////////////////////////////
  app.controller('IndexCtrl', function($rootScope, $scope, $routeParams, $http){
    console.log("test!")
  });

  app.controller('MapSelectCtrl', function($scope) {
    $scope.newWayPoint = "";
    $scope.mapModel = [];

    $scope.addWayPoint = function() {
      $scope.mapModel.push($scope.newWayPoint);
    };
  });
})()