(function() {
  'use strict';

  var dir = function(SCGroup, OssUploadService, $compile, $timeout, ywAlert) {
    return {
      restrict: 'EA',
      scope: {
        talk: '='
      },
      templateUrl: 'templates/scFeaturedTalkEditor.html',
      link: function(scope) {
        var scTalk = new SCGroup(scope.talk.id);

        function _initDropzone(options) {
          function _onAddedFile(file) {
            const ossUploadOptions = scTalk.getOssUploadOptions({
              name: options.name,
              file: file,
              key: options.key,
              scope: scope,
              alertContainer: '.admin-page'
            });

            scope.$apply(() => {
              scope[`${options.name}Uploading`].processing = true;
            });

            OssUploadService.init()
              .then(ossUpload => {
                ossUpload.upload(ossUploadOptions);
              }, err => {
                console.log(err);
                ywAlert.create({
                  message: 'Oops!出错了!',
                  type: 'error'
                });
              });
          }

          return new Dropzone(options.elementId, {
            url: 'nourl',
            autoProcessQueue: false,
            acceptedFiles: options.acceptedFiles, //'audio/*',
            previewTemplate: $compile('<div><div class="dz-preview loader"><div>正在上传</div><ion-spinner></ion-spinner></div></div>')(scope).html(),
            init: function() {
              this.on('addedfile', _onAddedFile);
            }
          });
        }

        scope.bannerImgUploading = {
          processing: false,
          percentage: '0%'
        };

        $timeout(() => {
          _initDropzone({
            elementId: `#banner-img-dropzone-${scope.talk.id}`,
            acceptedFiles: 'image/*',
            name: 'bannerImg',
            key: `talks/talk_${scope.talk.id}/banner_img_${+new Date()}.jpg`
          });
        }, 500);
      }
    };
  };

  angular.module('AiliBot').directive('scFeaturedTalkEditor', dir);
})();
