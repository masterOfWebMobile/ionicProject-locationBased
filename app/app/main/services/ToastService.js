'use strict';
angular.module('main').service('Toast', function ($cordovaToast, $ionicPopup) {
  return {
    show: function (msg) {
      if (window.cordova) {
        $cordovaToast.show(msg, 'short', 'bottom')
          .then(function (success) {
            console.log(success);
          }, function (error) {
            console.log(error);
          });
      } else {
        $ionicPopup.alert({
          title: 'Alert',
          template: msg,
          okType: 'button button-clear button-assertive',
        });
      }
    }
  };
});
