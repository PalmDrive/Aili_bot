(() => {
  'use strict';

  const appBannerDir = ($timeout) => {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'templates/scAppBanner.html',
      scope: {
        download: '&'
      }
    };
  };

  angular.module('AiliBot').directive('scAppBanner', appBannerDir);
})();
