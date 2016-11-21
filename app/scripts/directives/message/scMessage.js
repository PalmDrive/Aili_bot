/**
 * sc-message directive
 *
 * @param model The message object
 * @param model.content
 * @param model.createdAt
 * @param model.thread
 * @param model.thread.threadId
 * @param model.thread.topic
 * @param groupId
 *
 * usage:
 * <sc-message model="message""></sc-message>
 */
(function() {
  'use strict';

  var dir = function() {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scMessage.html',
      replace: true,
      scope: {
        model: '='
      },
      controller: function($scope, Auth, $sce) {
        $scope.currentUser = Auth.getCurrentUser();
        $scope.trustedResourceUrl = (url) => {
          return $sce.trustAsResourceUrl(url);
        };
      }
    };
  };

  angular.module('AiliBot').directive('scMessage', dir);
})();
