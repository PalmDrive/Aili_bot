(function() {
  'use strict';

  angular.module('AiliBot').controller('WechatAuthCallbackController', function($scope, Auth, $stateParams, $state, $ionicNavBarDelegate, AudioContext) {
    var returnTo = Auth.getReturnTo(),
        code = $stateParams.code,
        params = returnTo && returnTo.params;

    $scope.$on('$ionicView.enter', function() {
      $ionicNavBarDelegate.showBackButton(false);
    });

    if (code) {
      Auth.wechatAuth.getWechatUserInfoAndLogin(code).then(function() {
        console.log('logged in!');

        if (returnTo) {
          // Add reauthUuid if AudioContext is not supported
          // Preparing for user to open the app in other browser and re-authenticate
          if (AudioContext === null) {
            _.extend(params, {reauthUuid: Auth.getWxUnionid()});
          }

          $state.go(returnTo.state.name, params);
        }
      }, function(err) {
        console.log(err);
      });
    } else {
      alert('微信登陆失败');
    }
  });
})();
