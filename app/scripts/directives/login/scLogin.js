/**
 * sc-login
 *
 * <sc-login after-submit="afterSubmit(res)"></sc-login>
 */
(function() {
  'use strict';

  var ctrl = function($scope, Restangular, ywAlert, Auth, $state) {
    var Users = Restangular.all('users'),
        returnTo;

    $scope.user = {};

    $scope.submit = function() {
      if (!$scope.processing) {
        $scope.processing = true;
        Users.login({data: $scope.user, type: 'code'})
          .then(function(res) {
            $scope.processing = false;

            Auth.setCurrentUser(res);

            returnTo = Auth.getReturnTo();

            $scope.afterSubmit({res: res});

            returnTo ? $state.go(returnTo.state.name, returnTo.params) :  $state.go('admin.talks');
          }, function(err) {
            $scope.processing = false;
            ywAlert.create({
              message: err.data.errors[0].message,
              type: 'error'
            }, {container: '.admin-login-page'});
          });
      }
    }
  };

  var dir = function() {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        afterSubmit: '&'
      },
      templateUrl: 'templates/scLogin.html',
      controller: ctrl
    };
  };

  angular.module('AiliBot').directive('scLogin', dir);
})();
