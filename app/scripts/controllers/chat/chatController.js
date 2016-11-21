'use strict';

angular.module('AiliBot')
  .controller('ChatController', function(
    $scope,
    $stateParams,
    $timeout,
    $ionicScrollDelegate,
    $ionicNavBarDelegate,
    $rootScope,
    MessagesCollection,
    Auth,
    AudioContext,
    Util
  ) {
    const messagesScroll = $ionicScrollDelegate.$getByHandle('messagesScroll');
    let timerForScroll = null,
        isScrolling = false,
        scrollPositionBottom = null;

    $scope.model = {
      currentUser: Auth.currentUser
    };
    $scope.messagesLoaded = false;

    $scope.messages = new MessagesCollection();

    // init fetch
    $scope.messages.fetch({limit: 20})
      .then(() => {
        // Wait a little bit for view rendering
        // Avoid from calling fetchMoreMessages
        $timeout(() => {
          $scope.messagesLoaded = true;
        }, 500);
      });

    $scope.fetchMoreMessages = function() {
      if ($scope.messages.data.length === 0 || !$scope.messagesLoaded) {
        return $scope.$broadcast('scroll.infiniteScrollComplete');
      }

      return $scope.messages.fetch({
        where: {
          createdAt: {$lt: $scope.messages.data[0].attributes.createdAt}
        }
      }).then(() => {
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.$on('$ionicView.enter', function() {
      messagesScroll.scrollBottom(true);
    });

    $scope.$on('$ionicView.beforeEnter', function() {

    });

    $scope.$on('$ionicView.leave', function() {

    });

    $scope.$on('scMessage:add', () => {
      if (timerForScroll) {
        clearTimeout(timerForScroll);
        timerForScroll = null;
      }

      timerForScroll = setTimeout(function() {
        if (scrollPositionBottom === null || scrollPositionBottom <= messagesScroll.getScrollPosition().top) {
          messagesScroll.resize();
          messagesScroll.scrollBottom();
          setTimeout(() => {
            scrollPositionBottom = messagesScroll.getScrollPosition().top;
          }, 200);
        }
      }, 500);
    });

    $scope.onScroll = () => {
      // when it starts scrolling, broadcast the scroll:start event
      if (!isScrolling) {
        $scope.$broadcast('scroll:start');
        isScrolling = true;
      }
    };

    $scope.onScrollComplete = () => {
      isScrolling = false;
    };
  });
