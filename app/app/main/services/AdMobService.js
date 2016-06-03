'use strict';
/*global AdMob */
angular.module('main')
.service('AdMobService', function ($rootScope, $localStorage) {

  var TAG = 'AdMobService';

  var mInterstitialForAndroid = null;
  var mInterstitialForiOS = null;

  var isInterstitialReady = false;

  // Show interstitial every 15 minutes
  var THRESHOLD_MINUTES = 15;

  var getMinutesBetweenTimes = function (startTime, endTime) {
    var diff = endTime - startTime;
    return (diff / 60000);
  }

  var onAdLoaded = function () {
    isInterstitialReady = true;
    console.log('[' + TAG + '] onAdLoaded: ' + isInterstitialReady);
  }

  var onAdPresent = function () {
    $localStorage.lastAdTimestamp = new Date().getTime();
    console.log('[' + TAG + '] onAdPresent');
    console.log('[' + TAG + '] lastAdTimestamp = ' + $localStorage.lastAdTimestamp)
  }

  var requestInterstitial = function () {

    var interstitialId = ionic.Platform.isAndroid() ?
      mInterstitialForAndroid :
      mInterstitialForiOS;

    if (window.cordova && AdMob && interstitialId) {

      AdMob.prepareInterstitial({
        adId: interstitialId,
        autoShow: false
      });

      document.removeEventListener('onAdLoaded', onAdLoaded);
      document.addEventListener('onAdLoaded', onAdLoaded);
    } else {
      console.warn('[' + TAG + '] Unsupported platform');
    }
  }

  var onAdDismiss = function () {
    requestInterstitial();
    console.log('onAdDismiss');
  }

  var showBanner = function (bannerId) {
    if (window.cordova && AdMob && bannerId) {
      AdMob.createBanner({
        adId: bannerId,
        position: AdMob.AD_POSITION.BOTTOM_CENTER,
        autoShow: true
      });
    }
  }

  return {

    prepareInterstitial: function (interstitialForAndroid, interstitialForiOS) {
      mInterstitialForAndroid = interstitialForAndroid;
      mInterstitialForiOS = interstitialForiOS;

      document.addEventListener('onAdPresent', onAdPresent);
      document.addEventListener('onAdDismiss', onAdDismiss);

      requestInterstitial();
    },

    canShowInterstitial: function () {
      if (window.cordova && AdMob && isInterstitialReady) {

        // This will be true only the first time
        if (!$localStorage.lastAdTimestamp) {
          return true;
        }

        var lastAdTimestamp = $localStorage.lastAdTimestamp;
        var nowTime = new Date().getTime();
        var diff = getMinutesBetweenTimes(lastAdTimestamp, nowTime);
        console.log('[' + TAG + '] Ad showed ' + diff + ' minutes ago.');
        return diff > THRESHOLD_MINUTES;

      } else {
        return false;
      }
    },

    showBanner: function (bannerId) {
      showBanner(bannerId);
    },

    showInterstitial: function () {
      if (window.cordova && AdMob) {
        AdMob.showInterstitial();
      } else {
        console.warn('[' + TAG + '] Unsupported platform');
      }
    }
  };
});
