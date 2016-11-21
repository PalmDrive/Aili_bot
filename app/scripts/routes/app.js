'use strict';

(function() {
  angular.module('AiliBot')
    .constant('appRouter', $stateProvider => {
      $stateProvider
        .state('home', {
          url: '/?anything',
          data: {
            needAuth: false
          },
          // templateUrl: 'templates/home.html',
          // controller: 'HomeController'
        })
        .state('app', {
          url: '/app',
          abstract: true,
          templateUrl: 'templates/main.html',
          controller: 'MainController'
        })
        .state('app.login', { // temp one
          url: '/login',
          cache: false,
          data: {
            needAuth: false
          },
          views: {
            'viewContent': {
              // template: '<ion-view view-title="登陆" data-tap-disabled="true"><ion-content style="padding-left:15px;padding-right:15px"><br><br><div id="wechat-login-qr"></div></ion-content></ion-view>',
              // controller: function(Auth) {
              //   // new WxLogin({
              //   //   id: 'wechat-login-qr',
              //   //   appid: Auth.wechatAuth.config.appid,
              //   //   scope: 'snsapi_login',
              //   //   redirect_uri: Auth.wechatAuth.config.redirectUri
              //   // });
              // },
              resolve: {
                redirect: function(Auth) {
                  location.href = Auth.wechatAuth.getAuthUrl();
                }
              }
            }
          }
        })
        .state('app.wechatAuthCallback', {
          url: '/wechat_auth_callback?code',
          cache: false,
          data: {
            needAuth: false
          },
          views: {
            'viewContent': {
              template: '<ion-view view-title="小板凳"><ion-content><div class="loader"><p class="size-m">登录中</p><ion-spinner></ion-spinner></div></ion-content></ion-view>',
              controller: 'WechatAuthCallbackController'
            }
          }
        })
        .state('app.reauth', {
          url: '/reauth?reauthUuid',
          cache: false,
          data: {
            needAuth: false
          },
          resolve: {
            reauth: function(Auth, $stateParams, $state) {
              Auth.login({unionid: $stateParams.reauthUuid}).then(function() {
                var returnTo = Auth.getReturnTo();
                console.log('relogged in!');

                // @todo: remove reauthUuid query param
                // http://stackoverflow.com/questions/17376416/angularjs-how-to-clear-query-parameters-in-the-url
                // $location.url($location.path());

                if (returnTo) {
                  $state.go(returnTo.state.name, returnTo.params);
                }
              }, function(err) {
                console.log(err);
              });
            }
          }
        })
        .state('app.chat', {
          url: '/chat',
          cache: true,
          data: {
            needAuth: false
          },
          resolve: {
            auth: function(Auth) {
              if (!Auth.isLogin()) {
                return Auth.login({
                  username: 'Yujun',
                  password: 'p@ssword#1'
                });
                // return Auth.signup({
                //   username: 'Yujun',
                //   password: 'p@ssword#1',
                //   headimgurl: 'https://cdn.v2ex.com/gravatar/bf2e5fba57eb5191129cf1d1ff85336f?size=70'
                // }).then(obj => {
                //   console.log('signed up!');
                //   console.log(obj);
                //   return obj;
                // }, err => {
                //   console.log('err:');
                //   console.log(err);
                //   return false;
                // });
              } else {
                return true;
              }
            }
          },
          views: {
            'viewContent': {
              templateUrl: 'templates/chat.html',
              controller: 'ChatController'
            }
          }
        });
    });
})();

