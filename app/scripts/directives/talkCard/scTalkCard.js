(function() {
  'use strict';

  const talkCardDir = ($timeout) => {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scTalkCard.html',
      scope: {
        model: '='
      },
      controller($scope) {
        $scope.placeholder = {
          bg: '/images/talk/cover_placeholder.png'
        };

        $scope.cardBannerOverlayStyle = {};

        $scope.$watch('model', (newValue) => {
          if (newValue) {
            let model = newValue;

            // if the speaker has more than 4 tags, get the first 4 to show
            let tags = model.relationships.speaker.attributes.tags;
            if (tags.length > 4) {
              $scope.speakerTags = tags.slice(0, 4);
            } else {
              $scope.speakerTags = tags;
            }

            // add card banner style
            let coverImgUrl = model.attributes.getCoverImgUrls;
            if (coverImgUrl) {
              coverImgUrl = coverImgUrl.medium;
            } else {
              coverImgUrl = $scope.placeholder.bg;
            }
            $scope.cardBannerStyle = {
              'background-image': 'url(' + coverImgUrl + ')'
            };
          }
        });
      },
      link(scope, element) {
        const $card = $(element[0]),
            $title = $card.find('.talk-name'),
            $banner = $card.find('.card-banner');

        // use timeout to get actual height
        $timeout(() => {
          let titleHeight = $title.height();
          const BANNER_HEIGHT = 144,
                PADDING = 36,
                PHOTO_HEIGHT = 32.5;
          let restHeight = BANNER_HEIGHT - titleHeight - PADDING - PHOTO_HEIGHT + 3
          if (restHeight < 24) {
            let newTopPadding = (restHeight + 24) / 2 - 3;
            scope.cardBannerOverlayStyle['padding-top'] = newTopPadding + 'px';
          }
        }, 0);
      }
    };
  };

  angular.module('AiliBot').directive('scTalkCard', talkCardDir);
})();
