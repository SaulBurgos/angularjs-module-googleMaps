'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('MyCtrl1', function($scope,googleMapsService) {

	$scope.mapSrv = new googleMapsService(document.querySelector('#googleMap'),$scope);

	$scope.$on('$viewContentLoaded', function() {
   	$scope.mapSrv.loadMap();
	});

})

.controller('MyCtrl2', function($scope) {

});
