'use strict';
angular.module('main')
.controller('WalkthroughCtrl', function ($scope, $state, $localStorage) {

  $scope.onSkip = function () {
    $localStorage.walkthrough = true;
    $state.go('app.categories');
  }
});
