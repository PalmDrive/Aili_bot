(function() {
  'use strict';

  const talkPreviewDir = function(Util) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scTalkPreview.html',
      scope: {
        model: '='
      },
      controller: function($scope, uiGridConstants) {
        $scope.clipsGridOptions = {
          data: [],
          columnDefs: [
            {name: 'name', displayName: '标题', cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="admin.talk({talkId:row.entity.id})">{{MODEL_COL_FIELD}}</a></div>', width: '55%'},
            {field: 'formattedTalkLength()', displayName: '时长', width: '15%'},
            {field: 'formattedTalkStartedAt()', displayName: '开始于', width: '15%'},
            {name: 'clipOrder', displayName: '片段顺序', sort: {direction: uiGridConstants.ASC}, width: '15%'}
          ]
        };

        $scope.$watchCollection('model.talkClips', (val, preVal) => {
           if (val) {
            val.forEach(d => {
              d.formattedTalkStartedAt = function() {
                return Util.formattedDuration(parseInt(this.talkStartedAt / 1000));
              }.bind(d);
              d.formattedTalkLength = function() {
                return Util.formattedDuration(this.talkLength);
              }.bind(d);
            });
            $scope.clipsGridOptions.data = val;
          }
        });

        $scope.formattedDuration = Util.formattedDuration;

        $scope.isShown = function(priority) {
          return (priority !== -1 && priority !== -100);
        };

        let count = 0;

        /**
         * @FIXME:
         * Don't know why but it is called 39 times
         */
        $scope.formattedSlidesShownAt = function(shownAt) {
          if (!shownAt) {
            return shownAt;
          }

          count++;
          console.log(count);

          return shownAt.split('|').map(timestamp => {
            return Util.formattedDuration(+timestamp / 1000);
          }).join('|');
        };
      }
    };
  };

  angular.module('AiliBot').directive('scTalkPreview', talkPreviewDir);
})();
