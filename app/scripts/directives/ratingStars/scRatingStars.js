(() => {
  'use strict';

  const ratingStarsDir = () => {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scRatingStars.html',
      scope: {
        rating: '=', // e.g. 3.1415
        size: '@' // 10 or 12
      },
      controller($scope) {
        // round rating score to unit of 0.5
        $scope.roundToHalf = (num) => {
          return Math.round(num * 2) / 2;
        };
      }
    };
  };

  angular.module('AiliBot').directive('scRatingStars', ratingStarsDir);
})();
