/**
 * This is file is generated based on config/constants.js by the gulp task 'replace'
 * Therefore if wanna modify the file, the changes should be made in config/constants.js
 */

(function() {
  'use strict';

  /**
   * @ngdoc constant
   * @name AiliBot.API_ENDPOINT
   * @description
   * # API_ENDPOINT
   * Defines the API endpoint where our resources will make requests against.
   * Is used inside /services/ApiService.js to generate correct endpoint dynamically
   */

  const API_ENDPOINT = {
    host: '@@apiEndpoint.host',
    path: '@@apiEndpoint.path',
    V2path: '@@apiEndpoint.V2path',
    port: '@@apiEndpoint.port'
  };

  const OSS = {
    bucket: '@@oss.bucket'
  };

  const LEAN_CLOUD = {
    appId: '@@leanCloud.appId',
    appKey: '@@leanCloud.appKey'
  };

  API_ENDPOINT.url = API_ENDPOINT.port ? API_ENDPOINT.host + ':' + API_ENDPOINT.port + API_ENDPOINT.path : API_ENDPOINT.host + API_ENDPOINT.path;

  API_ENDPOINT.getURL = (apiVersion) => {
    apiVersion = apiVersion || 'v2';
    const path = apiVersion === 'v1' ? API_ENDPOINT.path : API_ENDPOINT.V2path;

    return API_ENDPOINT.port ? API_ENDPOINT.host + ':' + API_ENDPOINT.port + path : API_ENDPOINT.host + path;
  };

  angular.module('AiliBot')
    .constant('API_ENDPOINT', API_ENDPOINT)
    .constant('FIREBASE_APP', '@@firebaseApp')
    .constant('OSS_CONFIG', OSS)
    .constant('X_SMARTCHAT_KEY', '6f1ba4f85ee571b004ccfcf21329d6e197807cf556')
    .constant('ENV', '@@env')
    .constant('LEAN_CLOUD', LEAN_CLOUD);

    // live example with HTTP Basic Auth
    /*
    .constant('API_ENDPOINT', {
      host: 'http://yourserver.com',
      path: '/api/v2',
      needsAuth: true,
      username: 'whatever',
      password: 'foobar'
    });
    */


})();
