/**
 * sc-chat-input
 *
 * @param {Object} messages messages collection
 * @param {String} messagesContainerId the id of the messages container
 *
 * usage:
 * <sc-chat-input messages="messages" messages-container-id="#messages-container"></sc-chat-input>
 */
(function() {
  'use strict';

  var dir = function($timeout, $ionicScrollDelegate, Auth, Message) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scChatInput.html',
      replace: true,
      scope: {
        messages: '=',
        messagesContainerId: '@'
      },
      link: function(scope, element, $rootScope) {
        const $textInput = $(element[0]).find('#chat-text-input'),
            $messagesContainer = $(scope.messagesContainerId),
            messagesScroll = $ionicScrollDelegate.$getByHandle($messagesContainer.attr('delegate-handle')),
            currentUser = Auth.getCurrentUser();

        scope.sendingMessage = false;

        scope.message = Message.init();
        scope.mode = 1; // enter text

        scope.$on('elastic:resize', () => {
          let bottom;

          setTimeout(() => {
            if ($(element[0]).height()) {
              bottom = $(element[0]).innerHeight() + 'px';
              $messagesContainer.css({
                bottom: bottom
              });
            }

            messagesScroll.scrollBottom(true);
          }, 400);
        });

        // scope.$on('scroll:start', function() {
        //   console.log('blur');
        //   $textInput[0].blur();
        // });

        $textInput.on('focus', function() {
          // wait for the keyboard show up
          setTimeout(function() {
            messagesScroll.scrollBottom(true);
          }, 500);
        });

        scope.$on('$destroy', function() {
          $textInput.off('focus');
        });

        scope.changeMode = () => {

        };

        scope.sendMessage = function(e) {
          if (e) {
            e.preventDefault();
          }
          
          if (!scope.sendingMessage && scope.message.attributes.content.trim().length) {
            scope.sendingMessage = true;
            scope.messages.save(scope.message)
              .then(() => {
                scope.sendingMessage = false;
                
                // 事件通知chatController
                scope.$emit('sendMessage');
              });

            scope.message = Message.init();
            $textInput[0].focus();
          }
        };

        scope.$on('sendMessageByButton', (event, data) => {
          scope.message.attributes.content = data;
          scope.sendMessage();
        });
      }
    };
  };

  angular.module('AiliBot').directive('scChatInput', dir);
})();
