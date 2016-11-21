/**
 * sc-thread-row
 * @param model The message object
 * @param model.topic
 * @param model.author The user object
 * @param model.author.headimgurl
 * @param model.author.nickname
 * @param model.repliesCount
 * @param model.likes
 * @param model.likesCount
 * @param model.createdAt
 * @param [topicClip] if true, will limit the topic to single row
 *
 * usage:
 * <sc-thread-row model="thread" group-id="ddd" topic-clip="true" clickable="false"></sc-thread-row>
 */
(function() {
  'use strict';

  var ctrl = function($scope, Auth) {
    var userId = Auth.currentUser && Auth.currentUser.id,
        processing = false,
        blockDuration = 1000;

    $scope.toggleLikeThread = function(thread) {
      if (!userId || !$scope.groupId) {
        return;
      }

      if (!processing) {
        processing = true;
        if (!thread.isLiked) {
          thread.like(userId, $scope.groupId);
        } else {
          thread.unlike(userId, $scope.groupId);
        }
        setTimeout(function() {
          processing = false;
        }, blockDuration);
      }
    };
  };

   var dir = function() {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scThreadRow.html',
      replace: true,
      scope: {
        model: '=',
        groupId: '@',
        topicClip: '@'
      },
      controller: ctrl,
      link: function(scope) {
        scope.topicClip = scope.topicClip === 'true';
      }
    };
   };

  angular.module('AiliBot').directive('scThreadRow', dir);
})();
