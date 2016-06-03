'use strict';
/*global plugin */
angular.module('main')
.controller('PlaceNewCtrl', function ($scope, $translate, $ionicModal, $timeout,
  $localStorage, Place, Category, ParseFile, Toast, Camera, ActionSheet, AdMobService) {

  $scope.storage = $localStorage;

  $scope.categories = [];
  $scope.place = {};
  $scope.place.website = 'http://';

  $scope.isImageOneUploading = false;
  $scope.isImageTwoUploading = false;
  $scope.isImageThreeUploading = false;
  $scope.isImageFourUploading = false;

  var trans;
  var isSavingPlace = false;

  var sideMenu = document.getElementById('side-menu');
  var div = document.getElementById('map_canvas2');
  var map = plugin.google.maps.Map.getMap(div);
  var marker;

  $scope.onScroll = function () {
    if (map) {
      map.refreshLayout();
    }
  }

  $scope.onSearchAddress = function () {

    var req = { address: $scope.place.address };

    if (req.address) {

      plugin.google.maps.Geocoder.geocode(req, function (results) {

        if (results.length) {
          var result = results[0];
          var position = result.position;

          $scope.place.location = position;

          if (!marker) {
            map.addMarker({
              position: position
            }, function (marker1) {
              marker = marker1;
              map.moveCamera({
                target: position,
                zoom: 16
              });
            });
          } else {
            marker.setPosition(position);
            map.moveCamera({
              target: position,
              zoom: 16
            });
          }
        } else {
          Toast.show(trans.noResultsFoundText);
        }
      });
    }
  }

  // Capturing event when Map load are ready.
  map.addEventListener(plugin.google.maps.event.MAP_READY, function () {
    map.setMyLocationEnabled(true);
    $timeout(function () {
      map.refreshLayout();
    }, 1000);

    var mapType = plugin.google.maps.MapTypeId.ROADMAP
    if ($scope.storage.mapType === 'satellite') {
      mapType = plugin.google.maps.MapTypeId.SATELLITE;
    }
    map.setMapTypeId(mapType);
  });

  var toLatLng = function (lat, lng) {
    return new plugin.google.maps.LatLng(lat, lng);
  };

  var onCameraChange = function (position) {
    if (marker) {
      var latLng = toLatLng(position.target.lat, position.target.lng);
      marker.setPosition(latLng);
      $scope.place.location = position.target;
    }
  }

  $scope.$on('$ionicView.leave', function () {
    sideMenu.style.visibility = 'visible';

    if (map) {
      map.setMyLocationEnabled(false);
      map.setClickable(false);
      map.off();
      map.clear();
      map.moveCamera({
        target: toLatLng(0.0, 0.0),
        zoom: 1
      });
    }
  });

  $scope.$on('$ionicView.beforeEnter', function () {
    // Fix issue with side menu + google maps
    sideMenu.style.visibility = 'hidden';

    if (map) {
      map.setMyLocationEnabled(true);
      map.setClickable(true);
      map.on(plugin.google.maps.event.CAMERA_CHANGE, onCameraChange);
    }
  });

  Category.all({ page: 1, limit: 100, filter: ''})
  .then(function (categories) {
    $scope.categories = categories;
  });

  var resetData = function () {
    $scope.place = {};
    $scope.place.website = 'http://';
    $scope.isImageOneUploading = false;
    $scope.isImageTwoUploading = false;
    $scope.isImageThreeUploading = false;
    $scope.isImageFourUploading = false;
  }

  $ionicModal.fromTemplateUrl('main/templates/categories-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.categoriesModal = modal;
  });

  $scope.openCategoriesModal = function () {
    $scope.categoriesModal.show();
    if (map) {
      map.setClickable(false);
    }
  }

  $scope.closeCategoriesModal = function () {
    $scope.categoriesModal.hide();
    if (map) {
      map.setClickable(true);
    }
  }

  $scope.onCategorySelected = function (category) {
    $scope.closeCategoriesModal();
    $scope.place.category = category;
  }

  $scope.uploadImageOne = function () {

    ActionSheet.show({
      title: trans.chooseOptionText,
      cancelText: trans.cancelText,
      options: [trans.photoLibraryText, trans.cameraText]
    }).then(function (option) {

      var sourceType = null;
      if (option === 1) {
        sourceType = 'photoLibrary';
      }
      return Camera.getPicture({sourceType: sourceType});
    }).then(function (image) {
      $scope.isImageOneUploading = true;
      return ParseFile.upload(image);
    }).then(function (savedFile) {
      $scope.isImageOneUploading = false;
      $scope.place.image = savedFile;
    }, function () {
      $scope.isImageOneUploading = false;
    })
  }

  $scope.uploadImageTwo = function () {

    ActionSheet.show({
      title: trans.chooseOptionText,
      cancelText: trans.cancelText,
      options: [trans.photoLibraryText, trans.cameraText]
    }).then(function (option) {

      var sourceType = null;
      if (option === 1) {
        sourceType = 'photoLibrary';
      }
      return Camera.getPicture({sourceType: sourceType});
    }).then(function (image) {
      $scope.isImageTwoUploading = true;
      return ParseFile.upload(image);
    }).then(function (savedFile) {
      $scope.isImageTwoUploading = false;
      $scope.place.imageTwo = savedFile;
    }, function () {
      $scope.isImageTwoUploading = false;
    })
  }

  $scope.uploadImageThree = function () {

    ActionSheet.show({
      title: trans.chooseOptionText,
      cancelText: trans.cancelText,
      options: [trans.photoLibraryText, trans.cameraText]
    }).then(function (option) {

      var sourceType = null;
      if (option === 1) {
        sourceType = 'photoLibrary';
      }
      return Camera.getPicture({sourceType: sourceType});
    }).then(function (image) {
      $scope.isImageThreeUploading = true;
      return ParseFile.upload(image);
    }).then(function (savedFile) {
      $scope.isImageThreeUploading = false;
      $scope.place.imageThree = savedFile;
    }, function () {
      $scope.isImageThreeUploading = false;
    })
  }

  $scope.uploadImageFour = function () {

    ActionSheet.show({
      title: trans.chooseOptionText,
      cancelText: trans.cancelText,
      options: [trans.photoLibraryText, trans.cameraText]
    }).then(function (option) {

      var sourceType = null;
      if (option === 1) {
        sourceType = 'photoLibrary';
      }
      return Camera.getPicture({sourceType: sourceType});
    }).then(function (image) {
      $scope.isImageFourUploading = true;
      return ParseFile.upload(image);
    }).then(function (savedFile) {
      $scope.isImageFourUploading = false;
      $scope.place.imageFour = savedFile;
    }, function () {
      $scope.isImageFourUploading = false;
    })
  }

  $scope.onSavePlace = function (isFormValid) {

    if (!isFormValid) {
      Toast.show(trans.formInvalidText);
    } else if (!$scope.place.image) {
      Toast.show(trans.errorUploadImageText);
    } else if (!$scope.place.category) {
      Toast.show(trans.errorChooseCategoryText);
    }  else if (!$scope.place.location) {
      Toast.show(trans.errorLocationMissingText)
    }
    else {

      isSavingPlace = true;

      Place.create($scope.place).then(function () {
        Toast.show(trans.placeSavedText);
        resetData();
        isSavingPlace = false;

        if (AdMobService.canShowInterstitial()) {
          AdMobService.showInterstitial();
        }
      },
      function (error) {
        Toast.show(error.message);
        isSavingPlace = false;
      });
    }
  }

  $scope.isSavingPlace = function () {
    return isSavingPlace;
  }

  $scope.$on('$destroy', function () {
    $scope.categoriesModal.remove();
  });

  $scope.$on('$ionicView.enter', function () {

    $translate(['formInvalidText', 'errorChooseCategoryText', 'errorUploadImageText',
    'errorLocationMissingText', 'placeSavedText', 'cancelText', 'chooseOptionText',
    'photoLibraryText', 'cameraText', 'noResultsFoundText'])
    .then(function (myTranslations) {
      trans = myTranslations;
    });
  });
});
