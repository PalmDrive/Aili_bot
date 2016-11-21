(function() {
  'use strict';

  angular.module('AiliBot').service('Auth', function(API_ENDPOINT, $q, $http, LocalStorage, LeanCloud, Util) {
    var _this = this;

    var apiURL = API_ENDPOINT.port ? API_ENDPOINT.host + ':' + API_ENDPOINT.port + API_ENDPOINT.path : API_ENDPOINT.host + API_ENDPOINT.path;


    var wechatAuth = {
      config: {
        appid: 'wxe74948cd9929edc4',
        redirectUri: encodeURIComponent('http://xiaobandeng.palmdrive.cn/app/wechat_auth_callback/'),
        baseUrlForCode: 'https://open.weixin.qq.com/connect/oauth2/authorize', //'https://open.weixin.qq.com/connect/qrconnect',
        scope: 'snsapi_userinfo'
      },
      getAuthUrl: function() {
        return this.config.baseUrlForCode + '?' + 'appid=' + this.config.appid + '&redirect_uri=' + this.config.redirectUri + '&response_type=code&scope=' + this.config.scope + '#wechat_redirect';
      },
      getWechatUserInfoAndLogin: function(code) {
        // @todo: this can be only one request.
        // get wechat user info and meanwhile log in the user
        // return Users.getWechatUserInfo({code: code}).then(function(userInfo) {
        //   return _this.login(userInfo);
        // });
      }
    };

    const setHttpHeaders = (loginedUser) => {
      loginedUser = loginedUser || this.getCurrentUser();
      $http.defaults.headers.common['X-Ailibot-Token'] = loginedUser.get('token');
    };

    // Export properties and methods

    this.getCurrentUser = () => {
      const currentUser = LeanCloud.User.current();

      // class Base {
      //   constructor(lcObject) {
      //     Object.assign(this, lcObject);

      //     if (this.objectId) {
      //       this.id = this.objectId;
      //     }

      //     //Object.setPrototypeOf(this, lcObject.__proto__);
      //     Object.assign(this.__proto__, lcObject.__proto__, lcObject.__proto__.__proto__);

      //     return this;
      //   }
      // }

      // class User extends Base {
      //   constructor(lcObject) {
      //     super(lcObject);
      //     return this;
      //   }

      //   newMethod() {
      //     console.log('new method');
      //   }
      // }

      // const user = new User(currentUser);

      return currentUser;
    };

    this.setCurrentUser = function(data) {
      this.currentUser = data;
      //this.usergroups = new UserGroupsArray(data.id);

      // save to localStorage
      LocalStorage.set('currentUser', data);
    };

    this.getReturnTo = function() {
      return LocalStorage.get('returnTo');
    };

    this.setReturnTo = function(data) {
      if (data === null) {
        LocalStorage.remove('returnTo');
      } else {
        LocalStorage.set('returnTo', data);
      }
    };

    this.getWxUnionid = function() {
      var decodedJWT = window.jwt_decode(this.currentUser.accessToken);
      return decodedJWT.wxUnionid;
    };

    this.isLogin = function() {
      const currentUser = this.getCurrentUser();
      return currentUser !== null && typeof currentUser !== 'undefined' && !_.isEmpty(currentUser);
    };

    this.signup = (userInfo) => {
      const user = new LeanCloud.User();
      user.setUsername(userInfo.username);
      // hardcode password for now
      user.setPassword(userInfo.password);
      user.set('token', Util.genRandomStr());
      if (userInfo.headimgurl) {
        user.set('headimgurl', userInfo.headimgurl);
      }
      return user.signUp()
        .then(loginedUser => {
          setHttpHeaders(loginedUser);
          return loginedUser;
        });
    };

    this.login = function(userInfo) {
      return LeanCloud.User.logIn(userInfo.username, userInfo.password)
        .then(loginedUser => {
          setHttpHeaders(loginedUser);
          return loginedUser;
        });
    };

    this.setHttpHeaders = setHttpHeaders;

    // hardcode the currentUser
    // this.currentUser = {
    //   "id": "57c80810-5c34-11e5-a321-71996d25dd47",
    //   "type": "users",
    //   "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjU3YzgwODEwLTVjMzQtMTFlNS1hMzIxLTcxOTk2ZDI1ZGQ0NyIsInd4VW5pb25pZCI6Im8zN3N4d2dmbloyVUtSYmVSUEFIcE1HdmwzTlUiLCJpYXQiOjE0NDI5NDY1NzJ9.xda2I0l9j8MBYr0U3bavY5NKHqsARs9llv4I5FisUE0",
    //   "firebaseAuthToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InVpZCI6IndlY2hhdDpvMzdzeHdnZm5aMlVLUmJlUlBBSHBNR3ZsM05VIiwiZGF0YSI6eyJpZCI6IjU3YzgwODEwLTVjMzQtMTFlNS1hMzIxLTcxOTk2ZDI1ZGQ0NyJ9fSwiaWF0IjoxNDQyOTQ2NTcyfQ.gO0eh__iEvK60ctbHbH_tCovYcpzckTABh6U18rKYf4"
    // };

    this.wechatAuth = wechatAuth;
  });
})();
