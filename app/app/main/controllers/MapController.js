'use strict';
/*global plugin  */
angular.module('main')
.controller('MapCtrl', function ($scope, $rootScope, $ionicLoading, $ionicModal,
  $state, $stateParams, $translate, $timeout, $localStorage, GoogleAnalytics,
  Toast, Place, AdMobService, Geolocation, Dialog) {

  GoogleAnalytics.trackView('Map Screen');

  $scope.maxRating = 5;
  $scope.storage = $localStorage;
  $scope.params = {
    location: null,
    categoryId: $stateParams.categoryId,
    distance: 100.00,
    page: 0,
  }

  var trans;

  $translate(['errorText', 'errorGpsDisabledText', 'errorLocationMissingText',
  'placesNotFoundText'])
    .then(function (myTranslations) {
      trans = myTranslations;
    });

  $scope.places = [];

  var markers = [];

  var setPosition = function (lat, lng) {
    return new plugin.google.maps.LatLng(lat, lng);
  };

  var sideMenu = document.getElementById('side-menu');
  var div = document.getElementById('map_canvas');
  var map = plugin.google.maps.Map.getMap(div);

  var isLoadingViewShown = false;
  var isMapViewShown = false;
  var isErrorViewShown = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isMapViewShown = true;
    isErrorViewShown = false;

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  };

  var showMap = function () {

    isMapViewShown = true;

    isLoadingViewShown = false;
    isErrorViewShown = false;
    $ionicLoading.hide();
  };

  var setMapPosition = function (position) {
    map.moveCamera({
      target: setPosition(position.lat, position.lng),
      zoom: 16,
    });
  }

  var animateCameraWithBounds = function (points) {

    if (points.length > 0) {
      var latLngBounds = new plugin.google.maps.LatLngBounds(points);

      map.moveCamera({
        target: latLngBounds
      });
    }
  }

  var setMapZoomToFit = function () {

    var points = [];

    for (var i = 0; i < $scope.places.length; i++) {
      var place = $scope.places[i];
      var position = setPosition(place.latitude, place.longitude);
      points.push(position);
    }

    points.push(setPosition(
      $scope.params.location.latitude,
      $scope.params.location.longitude));

    animateCameraWithBounds(points);
  }

  var setPlaces = function (places) {

    $scope.places = places;

    for (var i = 0; i < places.length; i++) {

      var place = places[i];

      var icon = '#E84545';

      if (place.category.get('icon')) {
        icon = {
          url: place.category.get('icon').url(),
          size: {
            width: 32,
            height: 32,
          }
        }
      }

      map.addMarker({
        place: place,
        position: setPosition(place.latitude, place.longitude),
        title: place.title,
        icon: icon,
        animation: plugin.google.maps.Animation.DROP,
        styles: {
          maxWidth: '80%'
        },
        snippet: place.description,
        placeId: place.id,
        markerClick: function (marker) {
          marker.showInfoWindow();
        },
        infoClick: function (marker) {
          $state.go('app.place', { placeId: marker.get('placeId')});
        }
      }, function (marker) {
        markers.push(marker);
      });
    }
  };

  var loadPlaces = function () {

    Place.all($scope.params).then(function (places) {
      setPlaces(places);
      showMap();

      if (places.length === 0) {
        Dialog.alert(trans.placesNotFoundText);
      } else {
        setMapZoomToFit();
      }

    }, function () {
      Toast.show(trans.errorText);
    });
  }

  var removePlaces = function () {
    $scope.places = [];
  }

  var removeMarkers = function () {
    for (var i = 0; i < markers.length; i++) {
      markers[i].remove();
    }
  }

  $scope.onSearchPlaces = function () {

    $timeout(function () {
      // Try to show the ad.
      if (AdMobService.canShowInterstitial()) {
        AdMobService.showInterstitial();
      }
    }, 4000);

    map.getCameraPosition(function (camera) {

      $scope.params.location.latitude = camera.target.lat;
      $scope.params.location.longitude = camera.target.lng;

      showLoading();
      removeMarkers();
      removePlaces();
      loadPlaces();
    });
  }

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  }

  $scope.showMap = function () {
    return isMapViewShown;
  }

  $scope.showErrorView = function () {
    return isErrorViewShown;
  }

  $scope.onReload = function () {
    showLoading();
    loadPlaces();
  }

  $scope.onPlaceClicked = function (place) {
    $scope.closePlacesModal();

    for (var i = 0; i < markers.length; i++) {
      if (markers[i].get('place') === place) {
        var marker = markers[i];
        marker.showInfoWindow();
        marker.getPosition(function (position) {
          setMapPosition(position);
        })
      }
    }
  }

  $ionicModal.fromTemplateUrl('main/templates/places-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.placesModal = modal;
  });

  $scope.openPlacesModal = function () {
    map.setClickable(false);
    $scope.placesModal.show();
  };

  $scope.closePlacesModal = function () {
    map.setClickable(true);
    $scope.placesModal.hide();
  };

  $scope.$on('$destroy', function () {
    $scope.placesModal.remove();
  });

  // Capturing event when Map load are ready.
  map.addEventListener(plugin.google.maps.event.MAP_READY, function () {
    map.setMyLocationEnabled(true);
    $timeout(function () {
      map.refreshLayout();
    }, 1000)

    var mapType = plugin.google.maps.MapTypeId.ROADMAP
    if ($scope.storage.mapType === 'satellite') {
      mapType = plugin.google.maps.MapTypeId.SATELLITE;
    }
    map.setMapTypeId(mapType);

    showLoading();

    Geolocation.getCurrentPosition().then(function (position) {

      $scope.params.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }

      loadPlaces();
    }, function (error) {

      $scope.params.location = null;

      var errorMessage;

      if (error.code === 1 || error.code === 3) {
        errorMessage = trans.errorGpsDisabledText;
      } else {
        errorMessage = trans.errorLocationMissingText;
      }
      Dialog.alert(errorMessage);

    });
  });


  $scope.$on('$ionicView.leave', function () {
    sideMenu.style.visibility = 'visible';
    map.setMyLocationEnabled(false);
    map.setClickable(false);
    map.off();
  });

  $scope.$on('$ionicView.beforeEnter', function () {
    // Fix issue with side menu + google maps
    sideMenu.style.visibility = 'hidden';
    map.setMyLocationEnabled(true);
    map.setClickable(true);
  });

  $rootScope.$on('$stateChangeStart', function (event, toState) {
    if (toState.name !== 'app.place' && toState.name !== 'app.map') {
      map.clear();
      map.moveCamera({
        target: setPosition(0.0, 0.0),
        zoom: 1
      });
    }
  });
});
