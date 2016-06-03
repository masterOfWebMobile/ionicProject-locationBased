'use strict';
angular.module('main').service('StatusBar', function ($cordovaStatusbar) {

  var TAG = 'StatusBarService';

  var luminance = function (hex, lum) {

    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');

    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    lum = lum || 0;

		// convert to decimal and change luminosity
    var rgb = '#', c, i;

    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }

  return {
    init: function (color) {

      if (window.StatusBar) {
        $cordovaStatusbar.overlaysWebView(true);

        if (window.ionic.Platform.isAndroid()) {
          color = luminance(color, -0.4);
        }

        $cordovaStatusbar.styleHex(color);
      } else {
        console.warn('[' + TAG + ']: Unsupported platform');
      }
    }
  };
});
