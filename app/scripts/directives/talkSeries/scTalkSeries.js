(function() {
  'use strict';

  const talkSeriesDir = ($timeout) => {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scTalkSeries.html',
      scope: {
        model: '='
      }
    };
  };

  angular.module('AiliBot').directive('scTalkSeries', talkSeriesDir);
})();
