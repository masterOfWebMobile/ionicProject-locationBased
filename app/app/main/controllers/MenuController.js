'use strict';
angular.module('main')
.controller('MenuCtrl',
  function ($scope, $rootScope, $state, $translate, $timeout, $ionicLoading,
    $ionicModal, $localStorage, User, Toast) {

    $scope.user = User.getLoggedUser();
    $scope.storage = $localStorage;

    var trans;
    $translate(['loggedOutText']).then(function (translations) {
      trans = translations;
    });

    $ionicModal.fromTemplateUrl('main/templates/settings.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('main/templates/auth-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.authModal = modal;
    });

    var showLoading = function () {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    };

    $scope.onNavigateToCategories = function () {
      $state.go('app.categories');
    };

    $scope.onNavigateToSearch = function () {
      $state.go('app.search');
    };

    $scope.onNavigateToNewPlace = function () {
      if ($scope.user) {
        $state.go('app.new');
      } else {
        $scope.authModal.show();
      }
    };

    $scope.onNavigateToProfile = function () {
      if ($scope.user) {
        $state.go('app.profile');
      } else {
        $scope.authModal.show();
      }
    };

    $scope.onNavigateToWalkthrough = function () {
      $scope.onCloseSettings();
      $state.go('walkthrough', {
        force: true
      });
    }

    $scope.onNavigateToFavorites = function () {
      if ($scope.user) {
        $state.go('app.favorites');
      } else {
        $scope.authModal.show();
      }
    }

    $scope.onOpenSettings = function () {
      $scope.modal.show();
    };

    $scope.onCloseSettings = function () {
      $scope.modal.hide();
    };

    $scope.onLogIn = function () {
      $scope.authModal.show();
    };

    $scope.onLanguageSelected = function (lang) {
      $scope.storage.lang = lang;
      $translate.use(lang);
    }

    $scope.onUnitSelected = function (unit) {
      $scope.storage.unit = unit;
    };

    $scope.onMapTypeSelected = function (type) {
      $scope.storage.mapType = type;
    };

    $scope.getPicture = function () {
      if ($scope.user) {
        if ($scope.user.get('photo')) {
          return $scope.user.get('photo').url();
        }
      }
      return 'main/assets/images/avatar.png';
    };

    $scope.onLogout = function () {
      showLoading();
      $timeout(logout, 1000);
    };

    function logout () {
      User.logOut();
      $ionicLoading.hide();
      $scope.user = null;
      Toast.show(trans.loggedOutText);
    }

    $rootScope.$on('onPhotoUpdated', function () {
      $scope.user = User.getLoggedUser();
    });

    $rootScope.$on('onAccountDeleted', function () {
      $scope.user = User.getLoggedUser();
    });

    $rootScope.$on('onUserLogged', function () {
      $scope.user = User.getLoggedUser();
      $scope.authModal.hide();
    });

    $rootScope.$on('onCloseAuthModal', function () {
      $scope.authModal.hide();
    });
  });
