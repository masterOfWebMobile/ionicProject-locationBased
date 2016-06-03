'use strict';
angular.module('main')
.controller('SearchCtrl', function ($scope, $ionicLoading, $state, $filter,
  Place, GoogleAnalytics, Toast) {

  GoogleAnalytics.trackView('Search Place Screen');

  $scope.places = [];
  $scope.maxRating = 5;
  $scope.params = {
    page: 0,
    search: '',
  }

  var isLoadingViewShown = false;
  var isPlacesViewShown = false;
  var isEmptyViewShown = false;
  var isInitialViewShown = true;

  var isMoreData = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isPlacesViewShown = false;
    isEmptyViewShown = false;
    isInitialViewShown = false;

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
    isEmptyViewShown = false;
    isInitialViewShown = false;

    $ionicLoading.hide();
  }

  var showEmptyView = function () {

    isEmptyViewShown = true;

    isPlacesViewShown = false;
    isLoadingViewShown = false;
    isInitialViewShown = false;

    $ionicLoading.hide();
  }

  var showInitialView = function () {

    isInitialViewShown = true;

    isEmptyViewShown = false;
    isPlacesViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  }

  var ensureMoreData = function (length) {
    isMoreData = false;
    if (length > 0) {
      isMoreData = true;
    }
  }

  var setPlaces = function (places) {
    for (var i = 0;i < places.length;i++) {
      $scope.places.push(places[i]);
    }
  }

  var setCurrentPage = function (page) {
    $scope.params.page = page;
  }

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

    }, function (error) {
      Toast.show(error.message);
    });
  }

  $scope.onNavigateToPlace = function (id) {
    $state.go('app.place', {
      placeId: id
    });
  }

  $scope.onSearch = function () {

    if ($scope.params.search !== '') {
      $scope.params.page = 0;
      $scope.places = [];
      $scope.params.search = $filter('lowercase')($scope.params.search);
      showLoading();
      loadPlaces();
    }
  }

  $scope.onLoadMore = function () {
    loadPlaces();
  }

  $scope.moreDataCanBeLoaded = function () {
    return isMoreData;
  }

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  }

  $scope.showPlaces = function () {
    return isPlacesViewShown;
  }

  $scope.showEmptyView = function () {
    return isEmptyViewShown;
  }

  $scope.showInitialView = function () {
    return isInitialViewShown;
  }

  showInitialView();

})
