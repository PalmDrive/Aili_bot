(function() {
  'use strict';

  const OssUploadService = function($q, OSS_CONFIG, $http, API_ENDPOINT) {
    let config = {
      bucket: OSS_CONFIG.bucket,
      endpoint: 'http://oss-cn-hangzhou.aliyuncs.com',
      chunkSize: 10000000, // 10MB
      concurrency: 5,
      stsToken: ''
    };

    const imgEndpoint = 'img-cn-hangzhou.aliyuncs.com';//@todo: use CDN

    //this.url = 'http://' + `${OSS_CONFIG.bucket}.${config.endpoint.replace('http://', '')}`;

    this.url = `http://${OSS_CONFIG.bucket}.${imgEndpoint}`;

    this.getFileOSSUrl = function(key) {
      return 'http://' + config.endpoint.replace('http://', `${config.bucket}.`) + '/' + key;
    };

    this.init = function(stsToken) {
      return this.setSTSToken()
        .then(() => new OssUpload(config));
    };

    this.setSTSToken = function() {
      return $http.get(`${API_ENDPOINT.url}/aliyun_sts`)
        .then(res => config.stsToken = res.data);
    };
  };

  angular.module('AiliBot').service('OssUploadService', OssUploadService);
})();
