'use strict';
angular.module('main')
.service('ActionSheet', function ($cordovaActionSheet, $q) {

  return {

    show: function (params) {

      var defer = $q.defer();

      if (window.cordova) {

        var options = {
          title: params.title,
          buttonLabels: params.options,
          addCancelButtonWithLabel: params.cancelText,
          androidEnableCancelButton: true,
          androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_HOLO_LIGHT
        };

        $cordovaActionSheet.show(options)
          .then(function (btnIndex) {
            if (btnIndex !== 3) {
              defer.resolve(btnIndex);
            }
            defer.reject('cancel');
          });

      } else {
        defer.reject('Unsupported platform');
      }
      return defer.promise;
    }
  };
});
