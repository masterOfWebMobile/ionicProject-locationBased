'use strict';
/*global Parse FB */
angular.module('main')
.service('Facebook', function ($q, $cordovaFacebook) {

  return {
    getCurrentUser: function () {

      var defer = $q.defer();

      $cordovaFacebook.getLoginStatus().then(function (success) {
        defer.resolve(success);
      }, function (error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    logIn: function () {

      var defer = $q.defer();

      if (window.cordova) {

        $cordovaFacebook.login(['public_profile', 'email'])
        .then(function (success) {
          defer.resolve(success);
        }, function (error) {
          console.error(error);
          defer.reject(error);
        });

      } else {
        Parse.FacebookUtils.logIn(null, {
          success: function (user) {
            defer.resolve(user);
          },
          error: function (user, error) {
            defer.reject(error);
          }
        });
      }

      return defer.promise;
    },

    logOut: function () {

      var defer = $q.defer();

      $cordovaFacebook.logout().then(function (success) {
        defer.resolve(success);
      }, function (error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    me: function () {

      var defer = $q.defer();

      if (window.cordova) {

        $cordovaFacebook.api(
          'me?fields=name,first_name,last_name,gender,email',
          ['public_profile']
        ).then(function (success) {
          defer.resolve(success);
        }, function (error) {
          console.error(error);
          defer.reject(error);
        });

      } else {
        window.fbAsyncInit = function () {

          FB.api(
            '/me',
            { fields: 'name, first_name, last_name, gender, email' },
            function (response) {

              if (!response || response.error) {
                defer.reject(response.error);
              } else {
                defer.resolve(response);
              }
            });
        };
      }

      return defer.promise;
    },
  };
	});
