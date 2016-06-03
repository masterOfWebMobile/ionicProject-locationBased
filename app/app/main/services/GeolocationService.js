'use strict';
angular.module('main')
.factory('Geolocation', function ($ionicPlatform, $q) {

  function getCurrentPosition () {
    var deferred = $q.defer();

    function onCurrentPositionResolved (position) {
      deferred.resolve(position);
    }

    function onCurrentPositionFailedToResolve (error) {
      deferred.reject(error);
    }

    $ionicPlatform.ready(function () {
      var options = { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true };
      navigator.geolocation.getCurrentPosition(
        onCurrentPositionResolved,
        onCurrentPositionFailedToResolve,
        options);
    });

    return deferred.promise;
  }

  return {
    getCurrentPosition: getCurrentPosition
  };
});
