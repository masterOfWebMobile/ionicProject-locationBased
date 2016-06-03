'use strict';
angular.module('main')
.controller('ProfileCtrl', function ($scope, $rootScope, $ionicHistory, $ionicLoading,
  $translate, $ionicModal, User, Toast, Camera, ParseFile, Dialog) {

  $scope.user = User.getLoggedUser();

  var trans;

  $translate(['profileUpdated', 'profileErrorUpdate', 'formInvalidText',
    'emailTakenText', 'okText', 'cancelText', 'deleteAccountConfirmText',
    'deleteAccountErrorText', 'deleteAccountSuccessText', 'deleteAccountText'])
    .then(function (translations) {
      trans = translations;
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

  var hideLoading = function () {
    $ionicLoading.hide();
  };

  var onPhotoUpdated = function () {
    $rootScope.$broadcast('onPhotoUpdated');
  };

  var resetUserData = function () {
    var user = User.getLoggedUser();

    $scope.formData = {
      name: user.get('name'),
      username: user.get('username'),
      email: user.get('email')
    }
  };

  $scope.onImageTapped = function () {

    Camera.getPicture().then(function (image) {
      showLoading();
      return ParseFile.upload(image);
    }).then(function (savedFile) {
      return User.setPhoto(savedFile);
    }).then(function () {
      hideLoading();
      onPhotoUpdated();
    }, function () {
      hideLoading();
    });
  };

  $scope.onDeleteAccount = function () {

    Dialog.confirm(
      trans.deleteAccountConfirmText,
      trans.deleteAccountText,
      [trans.cancelText, trans.okText])
    .then(function () {

      showLoading();

      User.destroy().then(function () {
        hideLoading();
        Toast.show(trans.deleteAccountSuccessText);
        User.logOut().then(function () {
          $rootScope.$broadcast('onAccountDeleted');
          $ionicHistory.goBack();
        })
      }, function () {
        hideLoading();
        Toast.show(trans.deleteAccountErrorText);
      })
    })
  }

  $scope.onUpdateProfile = function (isFormValid) {

    if (!isFormValid) {
      Toast.show(trans.formInvalidText);
    } else {

      showLoading();

      User.update($scope.formData).then(function () {
        Toast.show(trans.profileUpdated);
        hideLoading();
        $scope.closeProfileModal();
        resetUserData();
      }, function (error) {

        var errorMessage;

        if (error.code === 202 || error.code === 203) {
          errorMessage = trans.emailTakenText;
        } else {
          errorMessage = error.message;
        }

        Toast.show(errorMessage);
        hideLoading();
      });

    }
  }

  $ionicModal.fromTemplateUrl('main/templates/profile-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.profileModal = modal;
  });

  $scope.openProfileModal = function () {
    $scope.profileModal.show();
  }

  $scope.closeProfileModal = function () {
    $scope.profileModal.hide();
  }

  $scope.$on('$destroy', function () {
    $scope.profileModal.remove();
  });

  $scope.$on('$ionicView.enter', function () {
    resetUserData();
  });
});
