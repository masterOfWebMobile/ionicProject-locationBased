'use strict';
angular.module('main')
.controller('AuthCtrl',
  function ($scope, $state, $ionicLoading, $ionicModal, $translate, $rootScope,
    $q, Facebook, Dialog, User, Toast, GoogleAnalytics) {

    GoogleAnalytics.trackView('Auth Screen');

    var trans;

    $translate(['signInError', 'loggedInAsText', 'emailFacebookTakenText'])
      .then(function (myTranslations) {
        trans = myTranslations;
      });

    var showLoading = function () {

      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }

    var hideLoading = function () {
      $ionicLoading.hide();
    }

    var processFacebookLogin = function (fbAuthData) {

      showLoading();

      var fbData = null;

      return Facebook.me().then(function (data) {
        fbData = data;
        return User.findByEmail(data.email);
      }).then(function (user) {

        if (!user.id) {
          return User.signInViaFacebook(fbAuthData);
        } else if (user.get('authData')) {

          if (user.get('authData').facebook.id === fbData.id) {
            return User.signInViaFacebook(fbAuthData);
          }
        } else {
          var deferred = $q.defer();
          deferred.reject(trans.emailFacebookTakenText);
          return deferred.promise;
        }
      }).then(function () {
        return User.updateWithFacebookData(fbData);
      }).then(function (user) {
        hideLoading();
        $scope.closeAuthModal();
        $rootScope.$broadcast('onUserLogged');
        Toast.show(trans.loggedInAsText + ' ' + user.get('email'));
      }, function (error) {
        hideLoading();
        Dialog.alert(error);
      })
    }

    $scope.onLoginViaFacebook = function () {

      Facebook.getCurrentUser().then(function (response) {

        if (response.status === 'connected') {
          processFacebookLogin(response);
        } else {
          Facebook.logIn().then(function (authData) {
            processFacebookLogin(authData);
          });
        }
      });
    }

    $scope.closeAuthModal = function () {
      $rootScope.$broadcast('onCloseAuthModal');
    }

    $ionicModal.fromTemplateUrl('main/templates/sign-up.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function (modal) {
      $scope.signUpModal = modal;
    });

    $ionicModal.fromTemplateUrl('main/templates/sign-in.html', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function (modal) {
      $scope.signInModal = modal;
    });

    $scope.openSignInModal = function () {
      $scope.signInModal.show();
    }

    $scope.closeSignInModal = function () {
      $scope.signInModal.hide();
    }

    $scope.openSignUpModal = function () {
      $scope.signUpModal.show();
    }

    $scope.closeSignUpModal = function () {
      $scope.signUpModal.hide();
    }

    var onUserLogged = $rootScope.$on('onUserLogged', function () {
      $scope.closeSignUpModal();
      $scope.closeSignInModal();
    });

    $scope.$on('$destroy', function () {
      $scope.signUpModal.remove();
      $scope.signInModal.remove();
      onUserLogged();
    });

  });
