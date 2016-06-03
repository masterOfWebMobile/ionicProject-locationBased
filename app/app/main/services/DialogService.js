'use strict';
angular.module('main')
.service('Dialog', function ($cordovaDialogs, $q) {

  return {

    alert: function (message, title) {

      var defer = $q.defer();

      if (window.cordova) {

        $cordovaDialogs.alert(message, title)
          .then(function () {
            defer.resolve();
          });

      } else {
        defer.reject('Unsupported platform');
      }
      return defer.promise;
    },

    confirm: function (message, title, buttonsText) {

      var defer = $q.defer();

      if (window.cordova) {

        $cordovaDialogs.confirm(message, title, buttonsText)
          .then(function (result) {

            if (result === 2) {
              defer.resolve(true);
            }

            defer.reject(false);
          });

      } else {
        defer.reject('Unsupported platform');
      }
      return defer.promise;
    }
  };
});
