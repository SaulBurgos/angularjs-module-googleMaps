angularjs-Module-GoogleMaps
===========================

Module to use Google Maps like a service. I like use Google maps like a service and not like a directive, because I need to use a lot geometry methods.

List of Methods:

* calculateCircleArea
* calculateAreaRectangle
* calculateAreaPolygon
* calculateTotalDistancePolyline
* calculateDistanceBetween2Points
* updateMap
* deserializeCircle
* deserializePolygon
* deserializePolyline
* deserializeMvcArray
* deserializeRectangle
* deserializeMaker
* serializeMap
* serializeCircle
* serializePolygon
* serializePolyline
* serializeMvcArray
* serializeRectangle
* serializeMarker
* createAutocomplete
* geolocateUser
* addCustomMethods
* centerMapOnPoints
* createPolygon
* createPolyline
* createRectangle
* createCircle
* getBoundsFromString
* getRandomPositionByBounds
* restrictBounds
* showMarkers
* removeMarkers
* attachEventToElement
* generateRandomMarkers
* createMarkers
* removeDrawingMode
* activeDrawingMode
* loadMap


##Setup:
**Load Google Maps in your index.html**
```
<script src="http://maps.googleapis.com/maps/api/js?libraries=geometry,drawing,places&amp;sensor=false"></script>
```
**Load the module in your index.html**
```
<script src="js/googleMapsSrv.js"></script>
```
**Inject the module:**
```
angular.module('myApp', [
  'googleMapsSrv'
])
```
**Inject the service in your controler:**
```
.controller('MyCtrl1', function($scope,googleMapsService) {

	$scope.mapSrv = new googleMapsService(document.querySelector('#googleMap'),$scope);

	$scope.$on('$viewContentLoaded', function() {
   	$scope.mapSrv.loadMap();
	});

});
```
