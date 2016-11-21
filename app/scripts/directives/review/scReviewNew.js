/**
 * sc-review-new
 *
 * <sc-review-new groupId="aaa", modal-delegate="reviewModal"></sc-review-new>
 */
(function() {
  'use strict';

  function _getRating(stars) {
    return _.filter(stars, function(s) {
      return s.solid;
    }).length;
  }

  function _rateAll(stars, index, flag) {
    for (var i = 0; i <= index; i++) {
      stars[i].solid = flag;
    }
    return stars;
  }

  var ctrl = function($scope, Review, $ionicPopup, FirebaseRef, Auth, LocalFB) {
    var msgRef = FirebaseRef.child('messages/' + $scope.groupId);

    $scope.stars = [
      {solid: false},
      {solid: false},
      {solid: false},
      {solid: false},
      {solid: false}
    ];
    $scope.review = {
      rating: null,
      content: null
    };

    $scope.toggleStar = function(star, index) {
      if (!star.solid) {
        _rateAll($scope.stars, index, true);
      } else {
        var rating = _getRating($scope.stars);

        if (rating > 0) {
          _rateAll($scope.stars, rating - 1, false);
        }

        if (index + 1 < rating) {
          _rateAll($scope.stars, index, true);
        }
      }

      $scope.review.rating = _getRating($scope.stars);
    };

    $scope.submit = function() {
      $scope.form.$submitted = true;

      if ($scope.form.$valid) {
        var cachedUser = LocalFB.get('users/' + Auth.currentUser.id),
            nickname = cachedUser && cachedUser.attributes.nickname,
            popup = $ionicPopup.show({
              title: '递交中......',
              template: '<div class="loader"><ion-spinner></ion-spinner></div>'
            });

        new Review({groupId: $scope.groupId}).save($scope.review).then(function() {
          // create a sys message
          msgRef.push({
            content: (nickname ? nickname : '用户') + '已给该讲座评分',
            type: 6,
            createdAt: Firebase.ServerValue.TIMESTAMP,
            updatedAt: Firebase.ServerValue.TIMESTAMP
          });

          popup.close();
          $scope.modalDelegate.hide();
        }, function() {
          popup.close();
          alert('出错了，请稍微再试');
        });
      }
    };
  };

  var dir = function() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        groupId: '@',
        modalDelegate: '='
      },
      templateUrl: 'templates/scReviewNew.html',
      controller: ctrl
    };
  };

  angular.module('AiliBot').directive('scReviewNew', dir);
})();
