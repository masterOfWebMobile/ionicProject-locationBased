'use strict';
angular.module('main')
.controller('SignUpCtrl',
  function ($scope, $state, $ionicLoading, $ionicModal, $translate, $rootScope,
    User, Toast, GoogleAnalytics) {

    GoogleAnalytics.trackView('Sign Up Screen');

    var trans;

    $translate(['emailInvalidText', 'formInvalidText', 'authInvalidText',
    'emailTakenText', 'signInError', 'loggedInAsText'])
      .then(function (myTranslations) {
        trans = myTranslations;
      });

    $scope.registrar = {};

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

    var isEmailValid = function (email) {
      var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
      return re.test(email);
    }

    var resetForms = function () {
      $scope.registrar.name = '';
      $scope.registrar.username = '';
      $scope.registrar.email = '';
      $scope.registrar.password = '';
    }

    $scope.onSignUp = function (isFormValid) {

      if (!isEmailValid($scope.registrar.email) && $scope.registrar.email !== '') {
        Toast.show(trans.emailInvalidText);
      } else if (!isFormValid) {
        Toast.show(trans.formInvalidText);
      } else {

        showLoading();

        User.signUp($scope.registrar).then(function () {
          return User.signIn($scope.registrar);
        }).then(function () {
          showLogin();
          Toast.show(trans.loggedInAsText + ' ' + $scope.registrar.email);
          resetForms();
          $rootScope.$broadcast('onUserLogged');
        },
        function (error) {

          showLogin();

          var errorMessage;
          if (error.code === 202 || error.code === 203) {
            errorMessage = trans.emailTakenText;
          } else {
            errorMessage = error.message;
          }

          Toast.show(errorMessage);
        });
      }
    }

    resetForms();

  });
