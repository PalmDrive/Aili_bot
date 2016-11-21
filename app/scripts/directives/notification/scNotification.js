'use strict';

{
  const dir = () => {
    return {
      restrict: 'EA',
      scope: {
        model: '=',
        save: '&'
      },
      templateUrl: 'templates/scNotification.html',
      replace: true,
      controller($scope, ywAlert) {
        $scope.mode = 0;

        $scope.gotoEditMode = () => {
          if ($scope.mode === 0) {
            $scope.mode = 1;
          }
        };

        $scope.gotoReadMode = (e) => {
          e.stopPropagation();
          $scope.mode = 0;
        };

        $scope.update = (e) => {
          e.stopPropagation();
          $scope.save()
            .then(() => {
              ywAlert.create({message: '更新成功'});
              $scope.mode = 0;
            }, err => {
              ywAlert.create({message: '出错了，更新失败', type: 'error'});
            });
        };
      }
    }
  };

  angular.module('AiliBot').directive('scNotification', dir);
}
