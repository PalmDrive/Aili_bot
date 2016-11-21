(() => {
  'use strict';

  angular.module('AiliBot').directive('scAniInput', ($interval) => {
    return {
      restrict: 'E',
      template: '<input class="ani-input" placeholder="search...." type="text" name="ani-input" ng-model="search">',
      scope: {
        value: '@'
      },
      link(scope, element, attributes) {
        const search = scope.value;
        let index = -1;

        $interval(() => {
          if (index === -1) {
            scope.search = '';
          } else {
            scope.search += search[index];
          }

          index += 1;

          if (index >= search.length) { index = -1; }
        }, 100);
      }
    }
  });
})();
