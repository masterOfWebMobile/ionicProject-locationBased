'use strict';
/* global Parse */
angular.module('main').factory('ParseFile', function ($q) {

  return {

    upload: function (base64) {

      var defer = $q.defer();
      var parseFile = new Parse.File('image.jpg', { base64: base64 });

      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    uploadFile: function (file) {

      var defer = $q.defer();
      var parseFile = new Parse.File('image.jpg', file);

      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },
  };
});
