(function() {
  'use strict';

  /**
   * [userEditor description]
   * @param  {[type]} $parse [description]
   * @return {[type]}        [description]
   *
   * <sc-user-editor ng-model="user" on-save="saveUser"></sc-user-editor>
   */
  var userEditor = function($parse, $compile, $timeout, ywAlert, OssUploadService) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scUserEditor.html',
      replace: true,
      scope: {
        onSave: '&'
      },
      link: function(scope, element, attrs) {
        scope.user = $parse(attrs.ngModel)(scope.$parent);
        scope.headimgurlUploading = {
          percentage: '0%',
          processing: false
        };

        function _initDropzone(options) {
          const uploadingKey = `${options.name}Uploading`;

          function onerror(err) {
            scope.$apply(() => {
              scope[uploadingKey].processing = false;
              scope[uploadingKey].percentage = '0%';
            });
          }

          function oncomplete() {
            $('.dz-preview').remove();
            scope.user.attributes[options.name] = `${OssUploadService.url}/${options.key}`;
            ywAlert.create({message: '上传成功。'});
            scope.$apply(() => {
              scope[uploadingKey].processing = false;
              scope[uploadingKey].percentage = '0%';
              scope.user.save();
            });
          }

          function onprogress(evt) {
            scope.$apply(() => {
              scope[uploadingKey].percentage = Math.ceil(evt.loaded * 100 / evt.total) + '%';
            });
          }

          function _onAddedFile(file) {
            const ossUploadOptions = {
              key: options.key,
              file: file,
              onerror,
              onprogress,
              oncomplete
            };

            scope.$apply(() => {
              scope[`${options.name}Uploading`].processing = true;
            });

            OssUploadService.init()
              .then(ossUpload => {
                ossUpload.upload(ossUploadOptions);
              }, err => {
                console.log(err);
                ywAlert({
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

        scope.save = function() {
          if (!scope.processing) {
            scope.processing = true;
            return scope.onSave()()
              .then(function() {
                scope.processing = false;
              }, function() {
                scope.processing = false;
              });
          }
        };

        $timeout(() => {
          _initDropzone({
            elementId: '#headimg-dropzone',
            name: 'headimgurl',
            key: `users/user_${scope.user.id}/headimg_${+new Date()}.jpg`,
            acceptedFiles: 'image/*'
          });
        }, 500);
      }
    };
  };

  angular.module('AiliBot').directive('scUserEditor', userEditor);
})();
