/**
 * sc-whiteboard
 * @param model The whiteboard object
 * @param model.objectType
 * @param model.objectId
 * @param model.createdAt
 * @param model.updatedAt
 * @param groupId The group id
 *
 * usage:
 * <sc-whiteboard model="whiteboard" group-id="ddd"></sc-whiteboard>
 */
(function() {
  'use strict';

  var ctrl = function($scope, ThreadObject) {
    $scope.$watch('model.objectId', function(val) {
      if (val) {
        $scope.thread = new ThreadObject($scope.groupId, val);
      }
    });
  };

   var dir = function() {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scWhiteboard.html',
      replace: true,
      scope: {
        model: '=',
        groupId: '@'
      },
      controller: ctrl
    };
   };

  angular.module('AiliBot').directive('scWhiteboard', dir);
})();
