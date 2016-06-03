'use strict';
angular.module('main')
.controller('PlaceListCtrl', function ($scope, $rootScope, $ionicLoading, $state,
  $localStorage, $stateParams, $translate, $ionicModal, Geolocation, Place,
  GoogleAnalytics, Dialog) {

  GoogleAnalytics.trackView('Place List Screen');

  $scope.maxRating = 5;
  $scope.storage = $localStorage;
  $scope.categoryTitle = $stateParams.categoryTitle;

  $scope.params = {
    location: null,
    categoryId: $stateParams.categoryId,
    distance: 100.00,
    page: 0,
    search: '',
  }

  var trans;

  $translate(['twoBlocksText', 'sixBlocksText', 'errorGpsDisabledText',
  'errorLocationMissingText'])
    .then(function (translations) {

      trans = translations;

      $scope.distances = [
        { val: 0.20, text: translations.twoBlocksText },
        { val: 0.60, text: translations.sixBlocksText },
        { val: 1.00, text: '1 ' + $scope.storage.unit },
        { val: 5.00, text: '5 ' + $scope.storage.unit },
        { val: 10.00, text: '10 ' + $scope.storage.unit },
        { val: 25.00, text: '25 ' + $scope.storage.unit },
        { val: 50.00, text: '50 ' + $scope.storage.unit },
        { val: 100.00, text: '100 ' + $scope.storage.unit },
      ];
    });

  $scope.places = [];

  var isLoadingViewShown = false;
  var isPlacesViewShown = false;
  var isErrorViewShown = false;
  var isEmptyViewShown = false;

  var isMoreData = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isPlacesViewShown = false;
    isErrorViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  };

  var showPlaces = function () {

    isPlacesViewShown = true;

    isLoadingViewShown = false;
    isErrorViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showErrorView = function () {

    isErrorViewShown = true;

    isPlacesViewShown = false;
    isLoadingViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showEmptyView = function () {

    isEmptyViewShown = true;

    isErrorViewShown = false;
    isPlacesViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var ensureMoreData = function (length) {
    isMoreData = false;
    if (length > 0) {
      isMoreData = true;
    }
  };

  var setPlaces = function (places) {
    for (var i = 0;i < places.length;i++) {
      $scope.places.push(places[i]);
    }
  };

  var setCurrentPage = function (page) {
    $scope.params.page = page;
  };

  var loadPlaces = function () {

    Place.all($scope.params).then(function (places) {
      ensureMoreData(places.length);
      setCurrentPage($scope.params.page + 1);
      setPlaces(places);

      if ($scope.places.length === 0) {
        showEmptyView();
      } else {
        showPlaces();
      }

      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');

    }, function () {
      showErrorView();
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.onDistanceSelected = function (distance) {
    $scope.params.distance = distance;
    $scope.params.page = 0;
    $scope.places = [];
    $scope.closeDistanceModal();
    showLoading();
    loadPlaces();
  };

  $scope.onLoadMore = function () {
    loadPlaces();
  };

  $scope.moreDataCanBeLoaded = function () {
    return isMoreData;
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showPlaces = function () {
    return isPlacesViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorViewShown;
  };

  $scope.showEmptyView = function () {
    return isEmptyViewShown;
  };

  $scope.onReload = function () {
    showLoading();

    $scope.params.page = 0;
    $scope.places = [];

    Geolocation.getCurrentPosition().then(function (position) {
      $scope.params.location = position.coords;
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

      showErrorView();
    });
  };

  $ionicModal.fromTemplateUrl('main/templates/distance-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.distanceModal = modal;
  });

  $scope.openDistanceModal = function () {
    $scope.distanceModal.show();
  }

  $scope.closeDistanceModal = function () {
    $scope.distanceModal.hide();
  }

  $scope.navigateToMap = function () {
    $state.go('app.map', {
      categoryId: $stateParams.categoryId
    });
  };

  $scope.$on('$ionicView.enter', function (scopes, states) {

    if (states.direction === 'forward') {

      showLoading();

      Geolocation.getCurrentPosition().then(function (position) {
        $scope.params.location = position.coords;
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

        showErrorView();
      });
    }
  });

})
