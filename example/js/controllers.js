'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

.controller('MyCtrl1', function($scope,$q,googleMapsService) {

	$scope.mapSrv = new googleMapsService(document.querySelector('#googleMap'),$scope);

	$scope.loadMapMarkers = function() {
		var markers = $scope.mapSrv.generateRandomMarkers(10);
		var promise = $scope.mapSrv.attachEventToElement(markers,'click');
		promise.then(undefined,undefined,function(elementClicked) {
			console.log(elementClicked);
		});
	};

	$scope.$on('$viewContentLoaded', function() {
   	$scope.mapSrv.loadMap().then(function() {
		  $scope.loadMapMarkers();
		}, function(reason) {
		  alert(reason);
		});
	});

})

.controller('MyCtrl2', function($scope) {

});
