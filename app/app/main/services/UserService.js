'use strict';
/* global Parse */
angular.module('main').service('User', function ($q) {
  return {
    getLoggedUser: function () {
      return Parse.User.current();
    },

    signIn: function (data) {

      var defer = $q.defer();

      Parse.User.logIn(data.email, data.password, {
        success: function (user) {
          defer.resolve(user);
        },
        error: function (user, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    signUp: function (data) {
      var defer = $q.defer();
      var user = new Parse.User();
      user.set({'name': data.name });
      user.set({'username': data.email });
      user.set({'email': data.email });
      user.set({'password': data.password });
      user.set({'roleName': 'User' });

      user.save(null, {
        success: function (user) {
          user.setACL(new Parse.ACL(user));
          user.save();
          defer.resolve(user);
        },
        error: function (user, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    signInViaFacebook: function (authData) {

      var expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + authData.authResponse.expiresIn);
      expiration = expiration.toISOString();

      var facebookAuthData = {
        'id': authData.authResponse.userID,
        'access_token': authData.authResponse.accessToken,
        'expiration_date': expiration
      }

      var defer = $q.defer();

      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function (user) {
          defer.resolve(user);
        },
        error: function (user, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    findByEmail: function (email) {

      var defer = $q.defer();

      Parse.Cloud.run('findUserByEmail', { email: email }, {
        success: function (user) {
          defer.resolve(user);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    update: function (data) {
      var defer = $q.defer();

      var user = Parse.User.current();

      user.set({'name': data.name});

      if (data.email && data.email !== '') {
        user.set({'username': data.email});
        user.set({'email': data.email});
      }

      if (data.password && data.password !== '') {
        user.set('password', data.password);
      }
      user.save(null, {
        success: function (user) {
          defer.resolve(user);
        },
        error: function (user, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    updateWithFacebookData: function (data) {

      var defer = $q.defer();

      Parse.Cloud.run('saveFacebookPicture', {}, {
        success: function () {
          var user = Parse.User.current();
          user.set({'email': data.email});
          user.set({'username': data.email});
          user.set({'name': data.name});
          user.setACL(new Parse.ACL(user));
          user.save(null, {
            success: function () {
              user.fetch().then(function (userFetched) {
                defer.resolve(userFetched);
              }, function (error) {
                defer.reject(error);
              })
            },
            error: function (user, error) {
              defer.reject(error);
            }
          });
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    getPublicData: function () {

      var defer = $q.defer();

      var query = new Parse.Query('UserData');
      query.equalTo('user', Parse.User.current());
      query.first().then(function (userData) {

        if (userData) {
          defer.resolve(userData);
        } else {
          defer.reject(Parse.Promise.error({
            code: 1,
            message: 'User Data not found'
          }));
        }
      }, function (error) {
        defer.reject(error);
      });

      return defer.promise;
    },

    logOut: function () {

      var defer = $q.defer();
      Parse.User.logOut().then(function () {
        defer.resolve();
      },
      function () {
        defer.reject();
      });

      return defer.promise;
    },

    recoverPassword: function (email) {

      var defer = $q.defer();

      Parse.User.requestPasswordReset(email, {
        success: function () {
          defer.resolve();
        },
        error: function (error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    },

    destroy: function () {
      var defer = $q.defer();
      Parse.User.current().destroy().then(function () {
        defer.resolve();
      }, function () {
        defer.reject();
      });
      return defer.promise;
    },

    setPhoto: function (parseFile) {
      var defer = $q.defer();

      var user = Parse.User.current();
      user.set({'photo': parseFile});

      user.save(null, {
        success: function (user) {
          defer.resolve(user);
        },
        error: function (user, error) {
          defer.reject(error);
        }
      });

      return defer.promise;
    }
  };
});
