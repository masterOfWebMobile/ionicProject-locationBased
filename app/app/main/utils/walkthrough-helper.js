'use strict'
angular.module('main').directive('deviceSlider', function ($ionicPlatform) {

  return {
    scope: {
      device: '@'
    },
    restrict: 'E',
    replace: true,
    transclude: true,
    controller: function ($scope) {
      this.propagateTouch = function (touchEvent) {
        $scope.$broadcast('propagate-touch', touchEvent);
      };
    },
    link: function (scope, element, attr) {
      if (attr.device === 'auto' && $ionicPlatform.is('android')) {
        attr.device = 'nexus6';
      }

      if (attr.device === 'auto' && $ionicPlatform.is('ios')) {
        attr.device = 'iphone5';
      }
    },
    templateUrl: 'main/templates/device-slider.html'
  };
}).directive('deviceFrame', function () {
  return {
    restrict: 'E',
    require: '^deviceSlider',
    link: function (scope, element, attr, deviceSliderCtrl) {
      var ele = element[0];
      ele.addEventListener('touchstart', function (event) {
        deviceSliderCtrl.propagateTouch(event);
				// Don't need to call again center tabs, because as we mimic touch events,
				// when we start touching here it will start the touch move on the panels,
				// and that will trigger the center tabs action
      }, false);

      ele.addEventListener('touchmove', function (event) {
        deviceSliderCtrl.propagateTouch(event);
      }, false);

      ele.addEventListener('touchend', function (event) {
        deviceSliderCtrl.propagateTouch(event);
      }, false);
    }
  };
}).directive('deviceSlides', function (TouchService) {
  return {
    restrict: 'E',
    require: '^deviceSlider',
    link: function (scope, element) {
      var sliderSlides = element[0].querySelector('.slider-slides');

      scope.$on('propagate-touch', function (event, propagatedTouch) {
        TouchService.triggerTouch(sliderSlides, propagatedTouch);
      });
    }
  };
}).service('TouchService', function () {
	// inspired on: https://github.com/hammerjs/touchemulator/blob/master/touch-emulator.js
  function Touch (target, identifier, pos, deltaX, deltaY) {
    deltaX = deltaX || 0;
    deltaY = deltaY || 0;
    this.identifier = identifier;
    this.target = target;
    this.clientX = pos.clientX + deltaX;
    this.clientY = pos.clientY + deltaY;
    this.screenX = pos.screenX + deltaX;
    this.screenY = pos.screenY + deltaY;
    this.pageX = pos.pageX + deltaX;
    this.pageY = pos.pageY + deltaY;
  }

  function TouchList () {

    var touchList = [];

    touchList.item = function (index) {
      return this[index] || null;
    };

		// specified by Mozilla
    touchList.identifiedTouch = function (id) {
      return this[id + 1] || null;
    };

    return touchList;
  }

  function createTouchList (eventTarget, event) {
    var touchList = new TouchList();
		// Modified by me
    if (event.type !== 'touchend') {
      touchList.push(new Touch(eventTarget, 1, event.touches[0], 0, 0));
    }
    return touchList;
  }

  function getTouches (eventTarget, event) {
    var touchList = createTouchList(eventTarget, event);
    return touchList;
  }

  this.triggerTouch = function (newEventTarget, originalTouchEvent) {
    var newTouchEvent = document.createEvent('Event');
    newTouchEvent.initEvent(originalTouchEvent.type, true, true);

    newTouchEvent.touches = getTouches(newEventTarget, originalTouchEvent);
    newTouchEvent.targetTouches = getTouches(newEventTarget, originalTouchEvent);
    newTouchEvent.changedTouches = getTouches(newEventTarget, originalTouchEvent);

    newEventTarget.dispatchEvent(newTouchEvent);
  };
})
