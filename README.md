angularjs-Module-GoogleMaps
===========================

Module to use Google Maps like a service. I like use Google maps like a service and not like a directive, because I need  use a lot of  geometry methods. the following are a series a methods that I commonly used in my projects. 

List of Methods:

* addCustomMethods
* activeDrawingMode
* attachEventToElement
* calculateCircleArea
* calculateAreaRectangle
* calculateAreaPolygon
* calculateTotalDistancePolyline
* calculateDistanceBetween2Points
* centerMapOnPoints
* createPolygon
* createPolyline
* createRectangle
* createCircle
* createMarkers
* createAutocomplete
* updateMap
* deserializeCircle
* deserializePolygon
* deserializePolyline
* deserializeMvcArray
* deserializeRectangle
* deserializeMaker
* deserializeDrawingShape
* serializeDrawingShape
* serializeMap
* serializeCircle
* serializePolygon
* serializePolyline
* serializeMvcArray
* serializeRectangle
* serializeMarker
* geolocateUser
* getBoundsFromString
* getBoundsFromPolygon
* getRandomPositionByBounds
* generateRandomMarkers
* showMarkers
* removeMarkers
* removeDrawingMode 
* removeDrawingMode
* restrictBounds
* loadMap
* openInfoWindow 


##Setup:

**Load the module in your index.html**

```
<script src="googleMapsSrv.js"></script>
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

	$scope.$on('$viewContentLoaded', function() {
   		$scope.mapSrv = new googleMapsService(document.querySelector('#googleMap'),$scope);
		$scope.mapSrv.googleMapsLoaded.then(function() {
		       $scope.mapSrv.loadMap();		
		});
	});

});
```

Demo here  [demo](http://saulburgos.com/apps/googlemapModule/#/view1)
