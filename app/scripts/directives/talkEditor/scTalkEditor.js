(function() {
  'use strict';

  function _initSlideDropzone(talk, options) {
    return new Dropzone('#slides-dropzone', {
      headers: options.defaultHeaders,
      url: options.url,
      paramName: function() {
        return 'attachments';
      },
      acceptedFiles: 'image/*',
      accept: function(file, done) { // Validation
        if (!talk.attributes.SpeakerId) {
          return done('请先设置主讲人。');
        }

        done();
      },
      previewTemplate: $('#img-uploading-spinner').html(),
      uploadMultiple: true,
      parallelUploads: 20,
      init: function() {
        this.on('addedfile', function(file) {

        });

        this.on('sendingmultiple', function(files, xhr, formData) {
          files.forEach(function(file, i) {
            formData.append('data[' + i + '][attributes][UserId]', talk.attributes.SpeakerId);
            formData.append('data[' + i + '][attributes][order]', talk.slides.length + i);
          });
        });

        this.on('successmultiple', (files, res) => {
          res.data.forEach(data => {
            let slide = {id: data.id};
            _.extend(slide, data.attributes);

            talk.slides = talk.slides || [];
            talk.slides.push(slide);
          });

          if (talk.slides) {
            talk.slides = _.sortBy(talk.slides, 'order');
          }

          $('.dz-preview').remove();
          options.onSuccess();
        });
      }
    });
  }

  function _deleteQuestion(id, talkId, ref) {
    return new Promise(function(resolve, reject) {
      ref.child('threads/' + talkId + '/' + id).remove(function(err) {
        if (err) { return reject(err); }

        ref.child('replies/' + id).remove(function(err) {
          if (err) { return reject(err); }

          resolve(id);
        });
      });
    });
  }

  var dir = function($compile, $parse, ywAlert, API_ENDPOINT, FirebaseRef, $ionicModal, Util, Restangular, $q, SCGroup, $timeout, Auth, OssUploadService, Users) {
    function _alert(msg, type) {
      type = type || 'success';
      ywAlert.create({
        message: msg,
        type: type
      });
    }

    return {
      restrict: 'EA',
      templateUrl: 'templates/scTalkEditor.html',
      replace: true,
      scope: {
        hasSlides: '@',
        hasQuestions: '@',
        hasTalkClips: '@',
        afterSave: '&',
        mode: '@' // 0: for admin 1: for speaker
      },
      controller: function($scope, $element, uiGridConstants) {
        const invalidCharForFBKey = [/\./, /#/, /\$/, /\//, /\[/, /\]/];

        $scope.processing = false;

        $scope.mode = +$scope.mode || 0;

        $scope.audioUploading = {
          processing: false,
          percentage: '0%'
        };
        $scope.coverImgUploading = {
          processing: false,
          percentage: '0%'
        };
        $scope.thumbnailUploading = {
          processing: false,
          percentage: '0%'
        };
        $scope.talkMaterialUploading = {
          processing: false,
          percentage: '0%'
        };
        $scope.has = {
          slides: $scope.hasSlides === 'true',
          questions: $scope.hasQuestions === 'true',
          talkClips: $scope.hasTalkClips === 'true'
        };
        $scope.talk = $parse($element.attr('ng-model'))($scope.$parent);

        $scope.previousStatus = $scope.talk.attributes.status;

        $scope.isEntireTalk = $scope.talk.attributes.talkType === 0 || $scope.talk.attributes.talkType === 5;

        // sort slides by order
        if ($scope.talk.slides) {
          $scope.talk.slides = _.sortBy($scope.talk.slides, 'order');
        }
        $scope.sortableOptions = {
          containment: 'parent',
          cursor: 'move',
          opacity: 0.5,
          tolerance: 'pointer'
        };
        $scope.talkTypeOptions = [
          {value: 0, label: '普通'},
          {value: 5, label: '工具'},
          {value: 1, label: '片段'},
          {value: 2, label: '摘要'},
          {value: 3, label: '摘要片段'},
          {value: 4, label: '测试'}
        ];
        $scope.priorityOptions = [
          {value: -50, label: '深度隐藏（搜索不到）'},
          {value: -1, label: '隐藏（可搜索到）'},
          {value: 0, label: '显示'}
        ];
        $scope.statusOptions = [
          {value: 0, label: '未开始'},
          {value: 1, label: '进行中'},
          {value: 2, label: '结束'}
        ];
        $scope.permissionOptions = [
          {value: 0, label: '不需要'},
          {value: 1, label: '需要邀请码或分享'},
          {value: 2, label: '需要邀请码'}
        ];

        function _createNewTalk(newTalk) {
          newTalk = newTalk || Restangular.restangularizeElement(null, {}, 'groups');
          newTalk.attributes = {
            status: 2,
            talkType: 3,
            priority: -1, // not showing in explore list view
            SpeakerId: $scope.talk.attributes.SpeakerId,
            ParentTalkId: $scope.talk.id,
          };
          if ($scope.talk.talkClips) {
            newTalk.attributes.clipOrder = $scope.talk.talkClips.length;
          }
          return newTalk;
        }

        function _preprocessColData(d) {
          d.formattedTalkStartedAt = function() {
            return Util.formattedDuration(parseInt(this.attributes.talkStartedAt / 1000));
          }.bind(d);
          d.formattedTalkLength = function() {
            return Util.formattedDuration(this.attributes.talkLength);
          }.bind(d);
        }

        if ($scope.isEntireTalk) {
          $scope.clipsGridOptions = {
            data: 'data',
            columnDefs: [
              {field: 'attributes.description', displayName: '标题', cellTemplate: '<div class="ui-grid-cell-contents"><a ui-sref="admin.talk({talkId:row.entity.id})">{{MODEL_COL_FIELD}}</a></div>', width: '55%'},
              {field: 'attributes.formattedTalkLength', displayName: '时长', width: '15%'},
              {field: 'attributes.formattedTalkStartedAt', displayName: '开始于', width: '15%'},
              {field: 'attributes.clipOrder', displayName: '片段顺序', sort: {direction: uiGridConstants.ASC}, width: '15%', type: 'number'}
            ]
          };
          $scope.data = [];

          $timeout(() => {
            // Produce formatted talkLength and talkStartedAt
            _.each($scope.talk.talkClips, clip => {
              clip.attributes.formattedTalkLength = Util.formattedDuration(clip.attributes.talkLength);
              clip.attributes.formattedTalkStartedAt = Util.formattedDuration(parseInt(clip.attributes.talkStartedAt / 1000));
            });
            $scope.data = $scope.talk.talkClips;
          }, 5000);

          $scope.newTalk = _createNewTalk();
          $scope.afterCreateTalk = (res) => {
            _alert('创建成功。');
            $scope.showNewTalkModal = false;
            let clip = {
              id: res.id
            };
            _.extend(clip, $scope.newTalk.attributes);
            _preprocessColData(clip);
            $scope.clipsGridOptions.data.push(clip);
            _createNewTalk($scope.newTalk);
          };
        }

        $scope.onInvalidTag = function(tag) {
          _alert('不能包含特殊字符: ".", "#", "$", "/", "[", or "]"');
        };
      },
      link: function(scope, element, attrs) {
        var defaultHeaders = {
              'x-smartchat-key': '6f1ba4f85ee571b004ccfcf21329d6e197807cf556'
            },
            // To distinguish from Users service
            _Users = Restangular.all('users'),
            Talks = Restangular.all('groups'),
            scTalk = new SCGroup(scope.talk.id),
            // userLoginUrl =  API_ENDPOINT.url + '/users/login',
            // userFilterUrl = API_ENDPOINT.url + '/users',
            url,
            userEditorModal;

        function _addNewTalkModal() {
          $('#new-talk-modal-content').find('.scroll')
            .append($compile('<sc-talk-editor ng-model="newTalk" after-save="afterCreateTalk(res)">')(scope)[0]);
        }

        function _initDropzone(options) {
          function _onAddedFile(file) {
            const key = options.getKey ? options.getKey(file) : options.key;

            const ossUploadOptions = options.getOssUploadOptions ? options.getOssUploadOptions(file, options) : scTalk.getOssUploadOptions({
                    name: options.name,
                    file: file,
                    key,
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
                _alert('Oops!出错了!', 'error');
              });
          }

          return new Dropzone(options.elementId, {
            url: 'nourl',
            autoProcessQueue: false,
            acceptedFiles: options.acceptedFiles, //'audio/*',
            previewTemplate: $('#img-uploading-spinner').html(),
            init: function() {
              this.on('addedfile', _onAddedFile);
            }
          });
        }

        if (scope.isEntireTalk) {
          $timeout(() => {
            _addNewTalkModal();
          }, 400)
        }

        scope.scTalk = scTalk;

        scope.tagsSource = function(query) {
          return $q(function(resolve) {
            var arr = _.filter(['申请方法论', '英语考试', '背景提升', '励志心理', '专业揭秘', '申请经验', '职业发展'], function(str) {
              return str.match(query);
            });
            resolve(arr);
          });
        };

        scope.save = function() {
          if (!scope.processing && !scope.talkEditorForm.$invalid) {
            scope.processing = true;

            if (scope.talk.questions) {
              scope.talk.questions.forEach(q => {
                if(q.attributes.content === ''){
                  _deleteQuestion(q.id, scope.talk.id, FirebaseRef);
                }
              });
            }
            // save order data from draging
            if (scope.talk.slides) {
              scope.talk.slides.forEach((slide, i) => {
                slide.order = i;
              });
            }

            // Omit status and talkType for speaker
            if (scope.mode !== 0) {
              scope.talk.attributes = _.omit(scope.talk.attributes, ['status', 'talkType']);
            }

            scope.talk.save()
              .then(function(res) {
                _alert('保存成功。');
                scope.processing = false;

                // Change priority to -50 if a tool talk ends
                if (scope.talk.attributes.talkType === 5 && scope.previousStatus === 1 && scope.talk.attributes.status === 2) {
                  scope.talk.attributes.priority = -50;
                }
                scope.previousStatus = scope.talk.attributes.status;

                if (res.questions) {
                  scope.talk.questions = res.questions;
                }

                if (scope.afterSave) {
                  scope.afterSave({res: res});
                }

                // Display updated status for speaker
                if (scope.mode !== 0) {
                  scope.talk.attributes.status = res.attributes.status;
                }
              }, function(err) {
                console.log(err);
                scope.processing = false;
                _alert('哎呀，出错啦。', 'error');
              });
          }
        };

        scope.newQuestion = function() {
          scope.talk.questions = scope.talk.questions || [];
          scope.talk.questions.push({
            attributes: {
              content: '',
              replies: [{content: ''}]
            }
          });
        };

        scope.deleteQuestion = function(question) {
          var id = question.id;
          scope.talk.questions = _.reject(scope.talk.questions, function(q) {
            return question === q;
          });

          if (id) {
            _deleteQuestion(id, scope.talk.id, FirebaseRef)
              .then(function() {
                _alert('删除成功。');
              }, function(err) {
                _alert('哎呀，出错啦。', 'error');
              });
          }
        };

        scope.deleteSlide = function(slide) {
          var slideId = slide.id,
              params = {
                'fields[group]': 'slidesSequence',
                'include': 'slides',
                'fields[slide]': 'UserId,GroupId,ThreadId,id,order,description'
              };

          scope.talk.slides = _.reject(scope.talk.slides, function(s) {
            return s === slide;
          });
          return Restangular.one('slides', slideId).remove()
            .then(function() {
              _alert('删除成功。');
              // Fetch the group to sync slidesSequence
              return scTalk.get(params);
            })
            .then(function(g) {
              scope.talk.attributes.slidesSequence = g.attributes.slidesSequence;
              scTalk.setSlidesShownAt(scope.talk);
            }, function(err) {
              console.log(err);
              _alert('哎呀，出错啦。', 'error');
            });
        };

        scope.showUserEditorModal = function() {
          scope.newUser = {
            attributes: {
              wxUnionid: Util.genRandomStr(), // hardcode fake wxUnionid
              accountRole: 3 // user created by admin
            }
          };
          var userEditorHtml = $compile('<sc-user-editor ng-model="newUser" on-save="saveUser"></sc-user-editor>')(scope),
              userEditorModalHtml;

          userEditorHtml = angular.element('<div>').append(userEditorHtml).html();
          userEditorModalHtml = '<ion-modal-view class="admin user-editor-modal">' +
                                  '<button type="button" class="close" ng-click="userEditorModal.remove()">x</button>' +
                                  '<ion-header-bar><h1 class="title">编辑用户</h1></ion-header-bar>' +
                                  '<ion-content overflow-scroll="true" class="container">' +
                                    userEditorHtml +
                                  '</ion-content>' +
                                '</ion-modal-view>';

          scope.userEditorModal = $ionicModal.fromTemplate(userEditorModalHtml, {
            backdropClickToClose: false,
            scope: scope
          });

          scope.userEditorModal.show();
        };

        scope.saveUser = function() {
          return _Users.login({data: scope.newUser.attributes})
            .then(function() {
              scope.userEditorModal.remove();
              _alert('保存成功。');
            }, function(err) {
              return err;
            });
        };

        scope.showingNewTalkModal = () => {
          scope.showNewTalkModal = true;
        };

        // For user autocomplete
        scope.fetchUsers = function(query) {
          var params = {
            'filter[nickname]': query,
            'filter[accountRole]': '1,2,3',
            'fields[user]': 'id,nickname',
            'page[size]': 20
          };
          return _Users.getList(params)
            .then(function(users) {
              return users.map(function(u) {
                return {
                  label: u.attributes.nickname,
                  value: u.id
                };
              });
            });
        };

        if (scope.talk.speaker) {
          scope.userExternalModel = {
            value: scope.talk.speaker.id,
            label: scope.talk.speaker.nickname
          };
        } else {
          scope.userExternalModel = {};
        }
        scope.userModelToItemMethod = function(modelValue) {
          return modelValue;
        };

        // ng-model is an array in ion-autocomplete
        // this issue should be fixed in 0.3.2
        // https://github.com/guylabs/ion-autocomplete/issues/115
        // scope.$watch('_speakerId', function(val) {
        //   if (!_.isEmpty(val)) {
        //     scope.talk.attributes.SpeakerId = val;
        //   }
        // });

        if (scope.has.slides) {
          url = API_ENDPOINT.getURL('v2') + '/groups/' + scope.talk.id + '/slides';
          $timeout(function() { // Because it is inside ng-if
            // If accessed by advisors without login: method from talkEditController
            if (!Auth.getCurrentUser()) {
              Users.getById(scope.talk.attributes.SpeakerId)
                .then(user => {
                  const wxUnionid = user.attributes.wxUnionid;
                  return Users.login({
                    data: {wxUnionid}
                  });
                })
                .then(res => {
                  defaultHeaders.Authorization = `Bearer ${res.accessToken}`;
                  _initSlideDropzone(scope.talk, {
                    url: url,
                    onSuccess() {
                      scope.$apply();
                      _alert('图片上传成功。');
                    },
                    defaultHeaders: defaultHeaders
                  });
                });
            } else { // With normal admin login
              defaultHeaders.Authorization = 'Bearer ' + Auth.getCurrentUser().accessToken;
              _initSlideDropzone(scope.talk, {
                url: url,
                onSuccess() {
                  scope.$apply();
                  _alert('图片上传成功。');
                },
                defaultHeaders: defaultHeaders
              });
            }

            _initDropzone({
              elementId: '#audio-dropzone',
              name: 'audio',
              key: `talks/talk_${scope.talk.id}/recordings.mp3`,
              acceptedFiles: 'audio/*'
            });

            _initDropzone({
              elementId: '#cover-img-dropzone',
              name: 'coverImg',
              key: `talks/talk_${scope.talk.id}/cover_img_${+new Date()}.jpg`,
              acceptedFiles: 'image/*'
            });

            _initDropzone({
              elementId: '#thumbnail-dropzone',
              name: 'thumbnail',
              key: `talks/talk_${scope.talk.id}/thumbnail_${+new Date()}.jpg`,
              acceptedFiles: 'image/*'
            });

            _initDropzone({
              elementId: '#talk-material-dropzone',
              name: 'talkMaterial',
              getKey(file) {
                const name = file.name.trim().replace(/\s/g, '_');
                return `talk_materials/talk_${scope.talk.id}/${name}`;
              },
              acceptedFiles: '',
              getOssUploadOptions(file, options) {
                const name = file.name.trim().replace(/\s/g, '_'),
                      key = `talk_materials/talk_${scope.talk.id}/${name}`,
                      uploadingKey = `${options.name}Uploading`;

                return {
                  key,
                  file,
                  maxRetry: 3,
                  onerror() {
                    _alert('Oops!上传失败。请稍后再试一次。', 'error');
                    scope.$apply(() => {
                      scope[uploadingKey].processing = false;
                      scope[uploadingKey].percentage = '0%';
                    });
                  },
                  onprogress(evt) {
                    scope.$apply(() => {
                      scope[uploadingKey].percentage = Math.ceil(evt.loaded * 100 / evt.total) + '%';
                    });
                  },
                  oncomplete() {
                    $('.dz-preview').remove();

                    // Create/upload talkMaterial
                    scTalk.saveTalkMaterial({
                      attachmentSrc: `${OssUploadService.url}/${key}`,
                      attachmentContentType: file.type,
                      attachmentFileName: file.name,
                      attachmentFileSize: file.size
                    })
                      .then(material => {
                        scope.talk.talkMaterials = scope.talk.talkMaterials || [];
                        scope.talk.talkMaterials.push(_.extend({id: material.id}, material.attributes));
                      });

                    _alert('上传成功。');
                    scope.$apply(() => {
                      scope[uploadingKey].processing = false;
                      scope[uploadingKey].percentage = '0%';
                    });
                  }
                };
              }
            });
          }, 500);
        }
      }
    };
  };

  const questionEditorDir = ($parse) => {
    return {
      restrict: 'EA',
      replace: true,
      scope: {},
      templateUrl: 'templates/scQuestionEditor.html',
      link(scope, element, attrs) {
        scope.question = $parse(attrs.ngModel)(scope.$parent);
      }
    };
  };

  const slideEditorDir = ($parse) => {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        mode: '@',
        order: '='
      },
      templateUrl: 'templates/scSlideEditor.html',
      controller: function($scope) {
        $scope._mode = +$scope.mode || 0;
      },
      link(scope, element, attrs) {
        scope.slide = $parse(attrs.ngModel)(scope.$parent);
      }
    };
  };

  const materialEditorDir = ($parse, ywAlert) => {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        scTalk: '='
      },
      templateUrl: 'templates/scTalkMaterialEditor.html',
      link(scope, element, attrs) {
        scope.model = $parse(attrs.ngModel)(scope.$parent);
        scope.state = 0;

        scope.save = (evt) => {
          evt.preventDefault();
          scope.state = 0;
          scope.scTalk.saveTalkMaterial({
            attachmentFileName: scope.model.attachmentFileName
          }, scope.model.id)
            .then(() => {
              ywAlert.create({
                message: '保存成功',
              }, {container: '.admin-page'});
            }, err => {
              ywAlert.create({
                message: '保存失败',
                type: 'error'
              }, {container: '.admin-page'});
            });
        };

        scope.cancel = (evt) => {
          evt.preventDefault();
          scope.state = 0;
        };
      }
    }
  };

  const secToMillisecDir = () => {
    return {
      restrict: 'EA',
      require: '^ngModel',
      link(scope, elem, attrs, ctrl) {
        // model -> view
        ctrl.$formatters.unshift(function(modelValue) {
          if (!modelValue) {
            return modelValue;
          }

          return modelValue.split('|').map(timestamp => {
            return Math.round(+timestamp / 1000);
          }).join('|');
        });

        // view -> model
        ctrl.$parsers.unshift(function(viewValue) {
          if (!viewValue) {
            return viewValue;
          }

          return viewValue.split('|').map(timestamp => {
            return +timestamp * 1000;
          }).join('|');
        });
      }
    }
  };

  angular.module('AiliBot').directive('scTalkEditor', dir);
  angular.module('AiliBot').directive('scQuestionEditor', questionEditorDir);
  angular.module('AiliBot').directive('scSlideEditor', slideEditorDir);
  angular.module('AiliBot').directive('scTalkMaterialEditor', materialEditorDir);
  angular.module('AiliBot').directive('secToMillisec', secToMillisecDir);
})();
