'use strict';
angular.module('main')
.service('Share', function ($cordovaSocialSharing) {

  var TAG = 'ShareService';

  return {
    sharePlace: function (place) {
      if (window.cordova && place) {
        $cordovaSocialSharing
          .share(place.title, null, place.image.url(), place.website)
            .then(function (result) {
              console.log(result);
            }, function (err) {
              console.warn(err);
            });
      } else {
        console.warn('[' + TAG + '] Unsupported platform');
      }
    }
  };
});
