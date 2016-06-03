'use strict';
/*global cordova */
angular.module('main')
.factory('Pushwoosh', function ($q, $localStorage) {

  var TAG = 'PushWooshService';

  var pushNotification;
  var canPush = false;
  var params = null;

  function init (appId, googleProjectNumber) {

    if (window.cordova) {

      pushNotification = cordova.require('pushwoosh-cordova-plugin.PushNotification');

      if (window.ionic.Platform.isIOS()) {
        if (appId !== null && appId !== '') {
          params = { 'pw_appid': appId };
          canPush = true;
        }
        else {
          console.warn('[' + TAG + '] Invalid App ID');
        }

      }
      else if (window.ionic.Platform.isAndroid()) {
        if (googleProjectNumber !== null && googleProjectNumber !== '' && appId !== null && appId !== '') {
          params = {
            projectid: googleProjectNumber,
            'pw_appid': appId
          };
          canPush = true;
        }
        else {
          console.warn('[' + TAG + '] Invalid Google Project Number/App ID');
        }
      }
      else {
        console.warn('[' + TAG + '] Unsupported platform');
      }

      // Initialize the plugin
      pushNotification.onDeviceReady(params);

      //reset badges on app start
      if (window.ionic.Platform.isIOS()) {
        pushNotification.setApplicationIconBadgeNumber(0);
      }
    }
    else {
      console.log('[' + TAG + '] Unsupported platform');
    }
  }

  var pw = {
    init: function (appId, googleProjectNumber) {
      init(appId, googleProjectNumber);
    },

    registerDevice: function () {
      var deferred = $q.defer();

      if (canPush) {

        if (!$localStorage.push) {
          pushNotification.registerDevice(deferred.resolve, deferred.reject);
          $localStorage.push = true;
        }
        else {
          console.warn('[' + TAG + '] Device already registered.');
          deferred.resolve(false);
        }
        return deferred.promise;
      }

      deferred.resolve(false);
      return deferred.promise;

    },

    unregisterDevice: function () {
      if (canPush) {
        var deferred = $q.defer();
        pushNotification.unregisterDevice(deferred.resolve, deferred.reject);
        return deferred.promise;
      }
    }
  };

  return pw;
});
