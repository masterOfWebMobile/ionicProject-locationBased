'use strict';
angular.module('main')
.controller('SignInCtrl',
  function ($scope, $state, $ionicLoading, $ionicModal, $translate, $rootScope,
    Dialog, User, Toast, GoogleAnalytics) {

    GoogleAnalytics.trackView('Sign In Screen');

    var trans;

    $translate(['formInvalidText', 'authInvalidText', 'signInError',
    'loggedInAsText', 'recoverPasswordSuccessText', 'emailNotFoundText'])
      .then(function (myTranslations) {
        trans = myTranslations;
      });

    $scope.login = {};
    $scope.showRecoverPasswordForm = false;

    var showLoading = function () {

      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }

    var showLogin = function () {
      $ionicLoading.hide();
    }

    var resetForms = function () {
      $scope.login.email = '';
      $scope.login.password = '';
    }

    $scope.onSignIn = function (isFormValid) {

      if (!isFormValid) {
        Toast.show(trans.formInvalidText);
        return;
      }

      showLoading();

      User.signIn($scope.login).then(function () {
        showLogin();
        Toast.show(trans.loggedInAsText + ' ' + $scope.login.email);
        resetForms();
        $rootScope.$broadcast('onUserLogged');
      }, function (error) {

        showLogin();

        var errorMessage;
        if (error.code === 101) {
          errorMessage = trans.authInvalidText;
        } else {
          errorMessage = error.message;
        }
        Toast.show(errorMessage);
      });
    }

    $scope.onRecoverPassword = function (bool) {
      $scope.showRecoverPasswordForm = bool;
    }

    $scope.recoverPassword = function (isFormValid) {

      if (!isFormValid) {
        Toast.show(trans.formInvalidText);
      } else {
        showLoading();

        User.recoverPassword($scope.login.email).then(function () {
          showLogin();
          $scope.showRecoverPasswordForm = false;
          Dialog.alert(trans.recoverPasswordSuccessText);
        }, function (error) {

          showLogin();

          var errorMessage = trans.errorText;

          if (error.code === 205) {
            errorMessage = trans.emailNotFoundText;
          }
          Dialog.alert(errorMessage);
        })
      }
    }

    resetForms();

  });
