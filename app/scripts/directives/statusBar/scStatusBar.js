/**
 * @directive sc-status-bar
 *
 * <sc-status-bar group="group"></sc-status-bar>
 *
 * @param {Object} model
 */
(function() {
  'use strict';

  var ctrl = function($scope, $interval) {
    var ticker;

    $scope.$watch('group.status', function(val, oldVal) {
      if (oldVal === undefined && val !== undefined) { // when the group data 'really' returned
        $scope.now = new Date().getTime();
        if ($scope.group.isStarting() || $scope.group.status === 1) {
          ticker = $interval(function() {
            $scope.now += 1000;
          }, 1000);
        }
      }

      if ((oldVal === 0 || oldVal === 1) && (val === 2 || val === 3 || val === 4)) {
        if (ticker) {
          $interval.cancel(ticker);
        }
      }
    });

    $scope.$on('$destroy', function() {
      if (ticker) {
        $interval.cancel(ticker);
      }
    });
  };

  var dir = function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scStatusBar.html',
      scope: {
        group: '='
      },
      controller: ctrl
    };
  };

  angular.module('AiliBot').directive('scStatusBar', dir);
})();
