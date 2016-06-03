'use strict';
angular.module('main')
.controller('ReviewListCtrl', function ($scope, $ionicLoading, $state,
  $ionicHistory, $stateParams, $translate, Review, GoogleAnalytics) {

  GoogleAnalytics.trackView('Review List Screen');

  if ($stateParams.clear) {
    $ionicHistory.clearHistory();
    $ionicHistory.clearCache();
  }

  var placeId = $stateParams.placeId;

  $scope.maxRating = 5;
  $scope.readOnly = true;

  $scope.reviews = [];

  var isLoadingViewShown = false;
  var isReviewViewShown = false;
  var isErrorViewShown = false;
  var isEmptyViewShown = false;

  var currentPage = 0;
  var isMoreData = false;

  var showLoading = function () {

    isLoadingViewShown = true;

    isReviewViewShown = false;
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

  var showReviews = function () {

    isReviewViewShown = true;

    isLoadingViewShown = false;
    isErrorViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showErrorView = function () {

    isErrorViewShown = true;

    isReviewViewShown = false;
    isLoadingViewShown = false;
    isEmptyViewShown = false;

    $ionicLoading.hide();
  };

  var showEmptyView = function () {

    isEmptyViewShown = true;

    isErrorViewShown = false;
    isReviewViewShown = false;
    isLoadingViewShown = false;

    $ionicLoading.hide();
  };

  var ensureMoreData = function (length) {
    isMoreData = false;
    if (length > 0) {
      isMoreData = true;
    }
  };

  var setReviews = function (reviews) {
    for (var i = 0;i < reviews.length; i++) {
      $scope.reviews.push(reviews[i]);
    }
  };

  var setCurrentPage = function (page) {
    currentPage = page;
  };

  var loadReviews = function () {

    Review.all(placeId, currentPage)
      .then(function (reviews) {
        ensureMoreData(reviews.length);
        setCurrentPage(currentPage + 1);
        setReviews(reviews);

        if ($scope.reviews.length === 0) {
          showEmptyView();
        } else {
          showReviews();
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');

      }, function (error) {
        showErrorView();
        GoogleAnalytics.trackException(error.message, false);
      });
  };

  $scope.onLoadMore = function () {
    loadReviews();
  };

  $scope.moreDataCanBeLoaded = function () {
    return isMoreData;
  };

  $scope.showLoadingView = function () {
    return isLoadingViewShown;
  };

  $scope.showReviews = function () {
    return isReviewViewShown;
  };

  $scope.showErrorView = function () {
    return isErrorViewShown;
  };

  $scope.showEmptyView = function () {
    return isEmptyViewShown;
  };

  $scope.onReload = function () {
    showLoading();
    loadReviews();
  };

  showLoading();
  loadReviews();

})
