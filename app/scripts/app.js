(function() {
  'use strict';

  var app = angular.module('AiliBot', ['ionic', 'restangular', 'monospaced.elastic', 'dibari.angular-ellipsis',  'yw.alert', 'ngWebSocket'])

    .run(function(Auth) {
      if (Auth.isLogin()) {
        Auth.setHttpHeaders();
      }
    })

    .config(function($locationProvider, $stateProvider, $urlRouterProvider, appRouter, ENV) {
      $locationProvider.html5Mode({
        enabled: ENV !== 'development',
        requireBase: false,
        rewriteLinks: false // disable url rewriting for relative links
      });

      // deal with trailing /
      $urlRouterProvider.rule(function(injector, location) {
        var path = location.path(),
            hasTrailingSlash = path[path.length-1] === '/',
            search = location.search(),
            url;

        if (hasTrailingSlash) {

          //if last charcter is a slash, return the same url without the slash
          url = path.substr(0, path.length - 1);

          if (search && !_.isEmpty(search)) {
            url += '?' + _.map(search, function(val, key) {
              return key + '=' + val;
            }).join('&');
          }

          return url;
        }
      });

      // Application routing
      appRouter($stateProvider);

      // redirects to default route for undefined routes
      $urlRouterProvider.otherwise('/');
    });
})();
