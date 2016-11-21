(function() {
  'use strict';

  angular.module('AiliBot').factory('AudioContext', function() {
    if (window.AudioContext || window.webkitAudioContext) {
      return new (window.AudioContext || window.webkitAudioContext)();
    } else {
      return null;
    }
  });
})();
