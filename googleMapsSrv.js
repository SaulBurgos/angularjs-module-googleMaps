﻿/*
 angularjs-module-googleMaps v0.0.1
 https://github.com/SaulBurgos/angularjs-module-googleMaps
*/

'use strict';

/* Services */

angular.module('googleMapsSrv', [])

.factory('googleMapsService',function($q) {
   var that; 

    var googleMaps = function(containerHtml,scope) {
      var deferred = $q.defer();   
      that = this;
      this.containerHTML = containerHtml;
      this.map;
      this.currentScope = scope;
      this.drawingManager;
      this.autocomplete;
      this.fixedBounds = {};
      this.infoWindow;
      this.googleMapsLoaded  = deferred.promise;

      $window.successMapApiLoaded = deferred.resolve;

      (function() {
         var script = document.createElement('script');
         script.type = 'text/javascript';
         script.src = 'http://maps.googleapis.com/maps/api/js?libraries=geometry,drawing,places&amp;sensor=false&callback=successMapApiLoaded';
         script.onload = function () {            
            console.log('google-loader has been loaded, but not the maps-API');
         };
         document.body.appendChild(script);
         //document.getElementsByTagName("head")[0].appendChild(script);
      })();
   };
    
   googleMaps.prototype.loadMap = function(customOptions) {
      var deferred = $q.defer();
      var mapDefaultOptions = {
         center: new google.maps.LatLng(-25.363882,131.044922),
         zoom: 8
      };        
      this.infoWindow = new google.maps.InfoWindow({ maxWidth: 400 });
      var optionsMap;
      if(typeof customOptions !== 'undefined') {
         optionsMap = customOptions;
      } else {
         optionsMap = mapDefaultOptions;
      }        

      try {
          //prevent load the map twice
         if( typeof this.map === 'undefined') {
            this.map = new google.maps.Map(this.containerHTML,optionsMap);
            google.maps.event.addListenerOnce(this.map, 'idle', function() {         
               that.currentScope.$apply(deferred.resolve());
            });
         }
      } catch(err) {
          deferred.reject('Error loading map');    
      }
      return deferred.promise; 
   };
   //require load drawing library on the script 
   googleMaps.prototype.activeDrawingMode = function() {
      this.drawingManager = new google.maps.drawing.DrawingManager();
      this.drawingManager.setMap(this.map);
   };

   //require load drawing library on the script 
   googleMaps.prototype.removeDrawingMode = function() {
      this.drawingManager.setMap(null);
   };
   
   googleMaps.prototype.openInfoWindow = function(content,anchor) {
      this.infoWindow.setContent(content);
      this.infoWindow.open(this.map,anchor);
   };  
    
   googleMaps.prototype.createMarkers = function(data, customOptions, insertMarkerInObj,viewportOnMarkers) {
      if(viewportOnMarkers) {
         var boundAdjust = new google.maps.LatLngBounds();
      }

      if(!angular.isArray(data)) {
         
         if(typeof data.latLng === 'undefined') {
            var positionSingle = new google.maps.LatLng(data.lat,data.lng);
         } else {
            var positionSingle = data.latLng;
         }

         var markerSingle = new google.maps.Marker({
            position: positionSingle,
            map: this.map,
            title: data.name
         });

         if(insertMarkerInObj){
            data.marker = markerSingle;
         }

         if(typeof customOptions !== 'undefined') {
            markerSingle.setOptions(customOptions);
         }

         if(viewportOnMarkers) {
            boundAdjust.extend(markerSingle.getPosition());
            this.map.fitBounds(boundAdjust);
         }
         return markerSingle;
      }

      var markers = [];      
      for (var i = 0; i < data.length; i++) {
         var position = new google.maps.LatLng(data[i].lat,data[i].lng);

         var marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: data[i].name
         });

         if(typeof customOptions !== 'undefined') {
            marker.setOptions(customOptions);
         }

         if(insertMarkerInObj){
            data[i].marker = marker;
         }

         if(viewportOnMarkers) {
            boundAdjust.extend(marker.getPosition());
         }
         markers.push(data[i]);                
      }; 
          
      if(viewportOnMarkers) {
         this.map.fitBounds(boundAdjust); 
      }  
      return markers;
   };

   //create random marker in map
   googleMaps.prototype.generateRandomMarkers = function(count) {
      var markerRandom = [] ; 
      var bounds = this.map.getBounds();
      var southWest = bounds.getSouthWest();
      var northEast = bounds.getNorthEast();
      var latSpan = northEast.lat() - southWest.lat();
      var lngSpan = northEast.lng() - southWest.lng();   
      for (var i = 0; i < count; i++) {  
         var lat = southWest.lat() + latSpan * Math.random();
         var lng = southWest.lng() + lngSpan * Math.random();
         var latlng = new google.maps.LatLng(lat, lng);     
         var marker = new google.maps.Marker({ 
            position: latlng,
            map: this.map
         });
         markerRandom.push(marker);
      }
      return markerRandom;
   };

   //attach any events to overlays,receive array of overlays
   googleMaps.prototype.attachEventToElement = function(data,eventName) {
      var deferred = $q.defer();

      function attachEvent (overlay,index) {
         google.maps.event.addListener(overlay,eventName,function() {
            that.currentScope.$apply(deferred.notify({
               index: index,
               element: overlay
            }));
         });
      };

      if(!angular.isArray(data)) {
         attachEvent(data,0);
      } else {

         for (var i = 0; i < data.length; i++) { 
            if(typeof data[i].marker !== 'undefined') {
               attachEvent(data[i].overlay,i);
            } else {
               attachEvent(data[i],i);
            }
         };    
      }
      return deferred.promise; 
   };
   //remove markers
   googleMaps.prototype.removeMarkers = function(data) {
      if(angular.isArray(data)) {
         for (var i = 0; i < data.length; i++) {
            if(data[i].marker) {
               data[i].marker.setMap(null);
            }
         };
      } else {
         data.marker.setMap(null);
      }
   };
   //show  markers
   googleMaps.prototype.showMarkers = function(data) { 
      if(angular.isArray(data)) {
         for (var i = 0; i < data.length; i++) {           
            data[i].marker.setMap(this.map);            
         }; 
      } else {
         data.marker.setMap(this.map);
      }              
   };

   //restrict the bounds change of the map to an area
   googleMaps.prototype.restrictBounds = function(bounds, showBounds) {
      this.fixedBounds.fixed = bounds;

      if(showBounds) {
         this.fixedBounds.boundsTest = new google.maps.Rectangle({
            bounds: this.fixedBounds.fixed,
            map: this.map,
            fillOpacity : 0.1
         });
         this.map.fitBounds(this.fixedBounds.fixed);
      }
      
      google.maps.event.addListener(this.map, 'bounds_changed', function() {
         clearTimeout(that.fixedBounds.timerBoundFixed);//clean timer bounds fixed  

         that.fixedBounds.timerBoundFixed = setTimeout(function() {
               var currentBounds = that.map.getBounds();
               //only if the current bounds is not contains in the fixed
               if( !(that.fixedBounds.fixed.contains(currentBounds.getNorthEast()) && 
                  that.fixedBounds.fixed.contains(currentBounds.getSouthWest())) ) {
                  that.map.fitBounds(that.fixedBounds.fixed);
               }
         },1000);

      });
   };

   //generate a latlng point,inside the bounds given
   googleMaps.prototype.getRandomPositionByBounds = function(bounds, objLatLng) {
      var lat_min = bounds.getSouthWest().lat(),
      lat_range = bounds.getNorthEast().lat() - lat_min,
      lng_min = bounds.getSouthWest().lng(),
      lng_range = bounds.getNorthEast().lng() - lng_min,
      randomLat = lat_min + (Math.random() * lat_range),
      randomLng = lng_min + (Math.random() * lng_range);

      if(objLatLng) {
         return new google.maps.LatLng(randomLat, randomLng);
      }else {
         return [randomLat, randomLng];
      }
   };
   
   //create a bounds from a Polygon
   googleMaps.prototype.getBoundsFromPolygon = function (polygon) {
      //initialize the bounds
      var bounds = new google.maps.LatLngBounds();

      polygon.getPath().forEach(function (latLng) {
         bounds.extend(latLng);
      });
      return bounds;
   };
   
   //use in conjuction with drawing manager method in this service
   googleMaps.prototype.serializeDrawingShape = function (shape) {
      var serializeObj;
      switch (shape.type) {
         case 'circle':
            serializeObj = this.serializeCircle(shape);               
         break;
         case 'rectangle':
            serializeObj = this.serializeRectangle(shape);
         break;

         case 'polygon':
            serializeObj = this.serializePolygon(shape);
         break;         
      }
      return serializeObj;
   };
   
   //use in conjuction with drawing manager method in this service
   googleMaps.prototype.deserializeDrawingShape = function (shape) {
      var overlay;

      switch (shape.type) {
         case 'circle':
            overlay = this.deserializeCircle(shape);
            break;
         case 'rectangle':
            overlay = this.deserializeRectangle(shape);
            break;

         case 'polygon':
            overlay = this.deserializePolygon(shape);
            break;
      }
      return overlay;
   };

   //create a bounds from a string 
   googleMaps.prototype.getBoundsFromString = function(stringBounds) {
      var Bounds = {};
      var boundsArray = stringBounds.split(",");
      Bounds.sw = new google.maps.LatLng(boundsArray[0],boundsArray[1]);
      Bounds.ne = new google.maps.LatLng(boundsArray[2],boundsArray[3]);
      Bounds.final = new google.maps.LatLngBounds(Bounds.sw, Bounds.ne);
      return Bounds.final;
   };

   //create a polgon
   googleMaps.prototype.createCircle = function(radius, center, customOptions) {
      var circleDefaultOptions = {
         strokeColor: '#FF0000',
         strokeOpacity: 0.8,
         strokeWeight: 2,
         fillColor: '#FF0000',
         fillOpacity: 0.35,
         map: this.map,
         center: center,
         radius: radius,
         editable: true,
         draggable: true
      };

      var circle = new google.maps.Circle(circleDefaultOptions);

      if(typeof customOptions !== 'undefined') {
         circle.setOptions(customOptions);
      }
      return circle;
   };

   //create rectangle
   googleMaps.prototype.createRectangle = function(bounds,customOptions) {
      
      var rectangle = new google.maps.Rectangle({
         bounds: bounds,
         map: this.map,
         fillOpacity : 0.1
      });

      if(typeof customOptions !== 'undefined') {
         rectangle.setOptions(customOptions);
      }
      return rectangle;
   };

   //create polyline
   googleMaps.prototype.createPolyline = function(mvcArray,customOptions) {
      var polyline = new google.maps.Polyline({
         path:  mvcArray,
         map : this.map
      });

      if(typeof customOptions !== 'undefined') {
         polyline.setOptions(customOptions);
      }
      return polyline; 
   };

   googleMaps.prototype.createPolygon = function(mvcArray,customOptions) {
      var polygon = new google.maps.Polygon({
         paths: mvcArray,
         strokeColor: '#FF0000',
         strokeOpacity: 0.8,
         strokeWeight: 2,
         fillColor: '#FF0000',
         fillOpacity: 0.35
      }); 

      if(typeof customOptions !== 'undefined') {
         polygon.setOptions(customOptions);
      }
      return polygon;
   };

   //center map to contain all points latlng, receive an array of latlng
   googleMaps.prototype.centerMapOnPoints = function(data) {
      var bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < data.length; i++) {
         bounds.extend(data[i]);   
      }; 
      this.map.fitBounds(bounds);  
   };

   // create custom method to add to google map
   googleMaps.prototype.addCustomMethods =  function() {
    
       google.maps.Polygon.prototype.getCenter = function () {
         var resultLat = 0;
         var resultLng = 0;
         this.getPath().forEach(function (element, index) {
            resultLat += element.lat();
            resultLng += element.lng();
         });
         resultLat = resultLat / this.getPath().getLength();
         resultLng = resultLng / this.getPath().getLength();
   
         return new google.maps.LatLng(resultLat, resultLng);
      }
      
      //code copy from https://github.com/bramus/google-maps-polygon-moveto
      if (!google.maps.Polygon.prototype.getBounds) {

         google.maps.Polygon.prototype.getBounds = function () {
            var bounds = new google.maps.LatLngBounds();
            var paths = this.getPaths();
            var path;

            for (var p = 0; p < paths.getLength() ; p++) {
               path = paths.getAt(p);
               for (var i = 0; i < path.getLength() ; i++) {
                  bounds.extend(path.getAt(i));
               }
            }

            return bounds;
         };

      }
      
      //code copy from https://github.com/bramus/google-maps-polygon-moveto
      google.maps.Polygon.prototype.moveTo = function (latLng) {

         // our vars
         var boundsCenter = this.getBounds().getCenter(), // center of the polygonbounds
            paths = this.getPaths(), // paths that make up the polygon
            newPoints = [], // array on which we'll store our new points
            newPaths = []; // array containing the new paths that make up the polygon

         // geodesic enabled: we need to recalculate every point relatively
         if (this.geodesic) {

            // loop all the points of the original path and calculate the bearing + distance of that point relative to the center of the shape
            for (var p = 0; p < paths.getLength() ; p++) {
               path = paths.getAt(p);
               newPoints.push([]);

               for (var i = 0; i < path.getLength() ; i++) {
                  newPoints[newPoints.length - 1].push({
                     heading: google.maps.geometry.spherical.computeHeading(boundsCenter, path.getAt(i)),
                     distance: google.maps.geometry.spherical.computeDistanceBetween(boundsCenter, path.getAt(i))
                  });
               }
            }

            // now that we have the "relative" points, rebuild the shapes on the new location around the new center
            for (var j = 0, jl = newPoints.length; j < jl; j++) {
               var shapeCoords = [],
                  relativePoint = newPoints[j];
               for (var k = 0, kl = relativePoint.length; k < kl; k++) {
                  shapeCoords.push(google.maps.geometry.spherical.computeOffset(
                     latLng,
                     relativePoint[k].distance,
                     relativePoint[k].heading
                  ));
               }
               newPaths.push(shapeCoords);
            }

         } else { // geodesic not enabled: adjust the coordinates pixelwise

            var latlngToPoint = function (map, latlng) {
               var normalizedPoint = map.getProjection().fromLatLngToPoint(latlng); // returns x,y normalized to 0~255
               var scale = Math.pow(2, map.getZoom());
               var pixelCoordinate = new google.maps.Point(normalizedPoint.x * scale, normalizedPoint.y * scale);
               return pixelCoordinate;
            };
            var pointToLatlng = function (map, point) {
               var scale = Math.pow(2, map.getZoom());
               var normalizedPoint = new google.maps.Point(point.x / scale, point.y / scale);
               var latlng = map.getProjection().fromPointToLatLng(normalizedPoint);
               return latlng;
            };

            // calc the pixel position of the bounds and the new latLng
            var boundsCenterPx = latlngToPoint(this.map, boundsCenter),
               latLngPx = latlngToPoint(this.map, latLng);

            // calc the pixel difference between the bounds and the new latLng
            var dLatPx = (boundsCenterPx.y - latLngPx.y) * (-1),
               dLngPx = (boundsCenterPx.x - latLngPx.x) * (-1);

            // adjust all paths
            for (var p = 0; p < paths.getLength() ; p++) {
               path = paths.getAt(p);
               newPaths.push([]);
               for (var i = 0; i < path.getLength() ; i++) {
                  var pixels = latlngToPoint(this.map, path.getAt(i));
                  pixels.x += dLngPx;
                  pixels.y += dLatPx;
                  newPaths[newPaths.length - 1].push(pointToLatlng(this.map, pixels));
               }
            }

         }

         // Update the path of the Polygon to the new path
         this.setPaths(newPaths);

         // Return the polygon itself so we can chain
         return this;

      };
      
      google.maps.Polygon.prototype.isInside = function(point) {
         // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
         var crossings = 0,
         path = this.getPath();

         // for each edge
         for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
         }

         // odd number of crossings?
         return (crossings % 2 == 1);

         function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

         }

      };

   };
  

   //Geolocate user, return latlng of user
   googleMaps.prototype.geolocateUser = function () {
      if (navigator.geolocation) {        
         navigator.geolocation.getCurrentPosition(function (position) { 
            var userPosition = new google.maps.LatLng(position.coords.latitude,position.coords.longitude); 
            return userPosition;
         },function showError(error) {
            var msgError = '';
            switch(error.code) 
            {
               case error.PERMISSION_DENIED:
                  msgError = "User denied the request for Geolocation.";
               break;
               case error.POSITION_UNAVAILABLE:
                  msgError = "Location information is unavailable.";
               break;
               case error.TIMEOUT:
                  msgError = "The request to get user location timed out.";
               break;
               case error.UNKNOWN_ERROR:
                  msgError = "An unknown error occurred.";
               break;
            }
            alert(msgError);
         });

      } else { 
         alert('Geolocation is not supported by this browser.');
      }
   };

   googleMaps.prototype.createAutocomplete = function (autoCompleteId,callback) {

      this.autocomplete = new google.maps.places.Autocomplete(document.querySelector(autoCompleteId));
      this.autocomplete.bindTo('bounds',this.map);//new way to do it 
      //this.autocomplete.setBounds(this.map.getBounds());//old way

      google.maps.event.addListener(this.autocomplete, 'place_changed', function() { 
         var place = this.getPlace();        
         
         if (!place.geometry) {
            return;
         }

         if (place.geometry.viewport) {
            that.map.fitBounds(place.geometry.viewport);
         } else {
            //use setcenter because sometimes google dont return the viewport property
            that.map.setCenter(place.geometry.location);
            that.map.setZoom(13);
         }

         if ( typeof callback !== 'undefined') {
            callback(place);
         };     

      });   

      //old method to update bounds
      /*google.maps.event.addListener(this.map, 'bounds_changed', function() {
         that.autocomplete.setBounds(this.getBounds());  
      });*/
   };

   googleMaps.prototype.serializeMarker = function (marker) {
      var object = {};
      object.position = marker.getPosition().toUrlValue();
      object.type = "marker";
      object.draggable = marker.getDraggable();
      return object;
   };

   googleMaps.prototype.serializeRectangle = function (rectangle) {
      var object = {};
      object.bounds = rectangle.getBounds().toUrlValue();
      object.type = "rectangle";
      object.editable = rectangle.getEditable();
      return object;
   };

   googleMaps.prototype.serializeMvcArray = function(mvcArray) {
      var path = [];
      for(var i= 0; i < mvcArray.getLength(); i++) {
         path.push(mvcArray.getAt(i).toUrlValue());
      }  
      return path.toString();
   };

   googleMaps.prototype.serializePolyline = function(polyline) {
      var object = {};  
      object.path = this.serializeMvcArray(polyline.getPath());
      object.type = "polyline";
      object.draggable = polyline.getEditable();
      return object;
   };

   googleMaps.prototype.serializePolygon = function(polygon) {
      var object = {};  
      object.path = this.serializeMvcArray(polygon.getPath());
      object.type = "polygon";
      object.draggable = polygon.getEditable();
      return object;
   };

   googleMaps.prototype.serializeCircle = function(circle) {
      var object = {};  
      object.center = circle.getCenter().toUrlValue();
      object.radius = circle.getRadius();
      object.type = "circle";
      object.draggable = circle.getEditable();
      return object;
   };

   googleMaps.prototype.serializeMap = function() {
      var object = {};
      object.zoom = this.map.getZoom();
      object.bounds = this.map.getBounds().toUrlValue(); 
      object.mapType = this.map.getMapTypeId();
      object.type = 'map';
      return object;
   };

   googleMaps.prototype.deserializeMaker = function (object) {
      var position = object.position.split(',');
      var latLng = new google.maps.LatLng(position[0],position[1]);
      var marker = new google.maps.Marker({
         position: latLng,
         draggable:object.draggable
      });
      return marker;
   };

   googleMaps.prototype.deserializeRectangle = function (object) {  
      var bounds = object.bounds.split(',');
      var swLatLng = new google.maps.LatLng(bounds[0],bounds[1]);
      var neLatLng = new google.maps.LatLng(bounds[2],bounds[3]);
      var rectangleBounds = new google.maps.LatLngBounds(swLatLng,neLatLng);
      var rectangle = new google.maps.Rectangle({
         bounds: rectangleBounds,
         editable:object.editable
      });
      return rectangle;
   };

   googleMaps.prototype.deserializeMvcArray = function(stringLatlng) {
      var arrayPoints = stringLatlng.split(',');
      var mvcArray = new google.maps.MVCArray();
      for(var i= 0; i < arrayPoints.length; i+=2)
      {
         var latlng = new google.maps.LatLng(arrayPoints[i],arrayPoints[i+1]);
         mvcArray.push(latlng);
      }  
      return mvcArray;
   };

   googleMaps.prototype.deserializePolyline = function (object) {   
      var mvcArray = this.deserializeMvcArray(object.path);
      var polyline = new google.maps.Polyline({
         path: mvcArray,
         draggable:object.draggable,
         editable:true
      });
      return polyline;
   };

   googleMaps.prototype.deserializePolygon = function (object) { 
      var mvcArray = this.deserializeMvcArray(object.path);
      var polygon = new google.maps.Polygon({
         paths: mvcArray,
         draggable:object.draggable,
         editable:true
      });
      return polygon;
   };

   googleMaps.prototype.deserializeCircle = function (object) {  
      var center = object.center.split(',');
      var centerLatLng = new google.maps.LatLng(center[0],center[1]);
      var circle = new google.maps.Circle({
         center: centerLatLng,
         radius: object.radius,
         draggable:object.draggable,
         editable:true
      });
      return circle;
   };

   googleMaps.prototype.updateMap = function (object){
      var bounds = object.bounds.split(',');
      var swLatLng = new google.maps.LatLng(bounds[0],bounds[1]);
      var neLatLng = new google.maps.LatLng(bounds[2],bounds[3]);
      var mapBounds = new google.maps.LatLngBounds(swLatLng,neLatLng);
      this.map.fitBounds(mapBounds);
      this.map.setZoom(object.zoom);  
      this.map.setMapTypeId(google.maps.MapTypeId[object.mapType.toUpperCase()]);
   };

   //return meters
   googleMaps.prototype.calculateDistanceBetween2Points = function(position1,position2) {
      //static method to calculate the distance
      var meters = google.maps.geometry.spherical.computeDistanceBetween(position1,position2);
      return meters.toFixed(2);
   };

   //total distance of whole path, getPath(), return meters
   googleMaps.prototype.calculateTotalDistancePolyline = function(path) {
      var distance = google.maps.geometry.spherical.computeLength(path);
      return distance.toFixed(2);
   };

   //compute area getPath(), Area in square meters
   googleMaps.prototype.calculateAreaPolygon = function(path){
      var area = google.maps.geometry.spherical.computeArea(path);
      return area.toFixed(2);
   };

   //Area in square meters
   googleMaps.prototype.calculateAreaRectangle = function(rectangle) {
      var rectangleBounds = rectangle.getBounds();
      var rectangleNorthEastBounds = rectangleBounds.getNorthEast();
      var rectangleNorthEastBoundsLatBounds = rectangleNorthEastBounds.lat();
      var rectangleNorthEastBoundsLngBounds = rectangleNorthEastBounds.lng();

      var rectangleSouthWestBounds = rectangleBounds.getSouthWest();
      var rectangleSouthWestBoundsLatBounds = rectangleSouthWestBounds.lat();
      var rectangleSouthWestBoundsLngBounds = rectangleSouthWestBounds.lng();

      var rectangleNorthWestBounds = new google.maps.LatLng(rectangleNorthEastBoundsLatBounds, rectangleSouthWestBoundsLngBounds);
      var rectangleSouthEastBounds = new google.maps.LatLng(rectangleSouthWestBoundsLatBounds, rectangleNorthEastBoundsLngBounds);
      var rectanglePath = [
         rectangleNorthEastBounds,
         rectangleSouthEastBounds,
         rectangleSouthWestBounds,
         rectangleNorthWestBounds,
         rectangleNorthEastBounds
      ]; 
      var rectangleArea = google.maps.geometry.spherical.computeArea(rectanglePath);
      return rectangleArea.toFixed(2);
   };

   //Area in square meters
   googleMaps.prototype.calculateCircleArea = function(radius) {
      var circleArea = radius*radius*Math.PI;
      return circleArea.toFixed(2);
   }
   
   //Move marker to new position using a new center, EX: markers inside a polygon, then you need to move the polygon and all marker should move with their relative position 
   googleMaps.prototype.moveMarker = function(marker,oldOverlayCenter,newOverlayCenter) {
     var lat = newCenter.lat() + marker.position.lat() - oldCenter.lat();
     var lng = newCenter.lng() + marker.position.lng() - oldCenter.lng();
     return {lat: lat, lng: lng};
   }
   
  //Get the position in pixel of a marker based on the map like container
  //http://stackoverflow.com/questions/1538681/how-to-call-fromlatlngtodivpixel-in-google-maps-api-v3
  googleMaps.prototype.getPixelPositionMarker = function(marker) {
    var scale = Math.pow(2, this.map.getZoom());
    var proj = this.map.getProjection();
    var bounds = this.map.getBounds();

    var nw = proj.fromLatLngToPoint(
     new google.maps.LatLng(
          bounds.getNorthEast().lat(),
          bounds.getSouthWest().lng()
     ));
    var point = proj.fromLatLngToPoint(marker.getPosition());
    return new google.maps.Point(Math.floor((point.x - nw.x) * scale),Math.floor((point.y - nw.y) * scale));
  }

  //Get the latlng position based on the map like container 
  googleMaps.prototype.getPositionFromPixel = function(pixel) {
   var scale = Math.pow(2, this.map.getZoom());
   var proj = this.map.getProjection();
   var bounds = this.map.getBounds();

   var nw = proj.fromLatLngToPoint(
     new google.maps.LatLng(
       bounds.getNorthEast().lat(),
       bounds.getSouthWest().lng()
     ));
   var point = new google.maps.Point();

   point.x = pixel.x / scale + nw.x;
   point.y = pixel.y / scale + nw.y;

   return proj.fromPointToLatLng(point);
  }

   return googleMaps;
})
  
.value('version', '0.1');
