(function() {
  'use strict';

  const utilFactory = function() {
    return {
      isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      },

      genRandomStr() {
        return Math.random().toString(36).substring(5) + '-' + (+ new Date());
      },

      isMobile() {
        const breakpoint = 768;
        return window.innerWidth <= breakpoint;
      },

      isWeChat() {
        const ua = navigator.userAgent.toLowerCase();
        return (/micromessenger/.test(ua)) ? true : false;
      },

      /**
       * [formattedDurationLength description]
       * @param  {Number} duration duration in sec
       * @return {String} formattedDuration
       */
      formattedDuration(duration) {
        duration = Math.round(duration);
        var hh = Math.floor(duration / 3600),
        mm, ss;

        duration -= 3600 * hh;
        mm = Math.floor(duration / 60);
        ss = duration - 60 * mm;

        return [
          ('0' + hh).slice(-2),
          ('0' + mm).slice(-2),
          ('0' + ss).slice(-2),
        ].join(':');
      }
    }
  };

  angular.module('AiliBot').factory('Util', utilFactory);
})();
