'use strict';
/*global Camera */
angular.module('main').service('Camera', function ($cordovaCamera, $q) {

  return {

    getPicture: function (params) {

      var defer = $q.defer();

      if (window.cordova) {

        var sourceType = Camera.PictureSourceType.CAMERA;

        if (params.sourceType === 'photoLibrary') {
          sourceType = Camera.PictureSourceType.PHOTOLIBRARY
        }

        var options = {
          quality: 70,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: sourceType,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 800,
          targetHeight: 800,
          saveToPhotoAlbum: false,
          correctOrientation: true
        }

        $cordovaCamera.getPicture(options).then(function (imageData) {
          defer.resolve(imageData);
        }, function (error) {
          defer.reject(error);
        });

      } else {
        defer.reject('Unsupported platform');
      }
      return defer.promise;
    }
  };
});
