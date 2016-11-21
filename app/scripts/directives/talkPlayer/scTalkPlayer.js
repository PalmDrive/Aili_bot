(function() {
  'use strict';

  const SlidesListFactory = function($timeout) {
    class SlidesList {
      /**
       * [constructor description]
       *
       * @param {Array} slides [{timstamp, content}]
       * @param  {Object} options
       * @param  {Function} options.onPlay Invoked when each slide starts to play
       *
       * @return {[type]}         [description]
       */
      constructor(slides, options) {
        this.slides = slides;
        this.options = options;
        this.currPlayTime = 0;
        this.currSlideIndex = -1;
        this.syncTimer = null;
      }

      play(time=0) {
        this.setCurrPlayTime(time);
        const nextSlide = this.slides[this.currSlideIndex + 1];

        if (nextSlide) {
          const period = nextSlide.timestamp - time;
          this.syncTimer = $timeout(() => {
            // Update _latestPlayedAt, currPlayTime and currSlideIndex
            this.currPlayTime += period;
            this.currSlideIndex += 1;

            this.options.onPlay(this);

            this.play(this.currPlayTime);
          }, period);
        } else {
          console.log('All slides are played');
          this.stop();
        }
      }

      pause(time) {
        this.setCurrPlayTime(time);
        if (this.syncTimer) {
          $timeout.cancel(this.syncTimer);
          this.syncTimer = null;
          console.log('cancel timer');
        }
      }

      resume(time) {
        this.play(time);
      }

      stop() {
        this.pause(0);
      }

      getCurrSlide() {
        return this.slides[this.currSlideIndex] ? this.slides[this.currSlideIndex].content : null;
      }

      // 1,2,3,4 <- 0 index: -1
      // 0,1,2,3 <- 0 index: 0
      resetCurrSlideIndex() {
        if (this.slides.length) {
          // reset currSlideIndex according to currPlayTime
          this.currSlideIndex = -1;
          if (_.last(this.slides).timestamp <= this.currPlayTime) {
            this.currSlideIndex = this.slides.length - 1;
          } else {
            for (let i = 1; this.slides[i]; i++) {
              if (this.slides[i].timestamp > this.currPlayTime && this.slides[i-1].timestamp <= this.currPlayTime) {
                this.currSlideIndex = i - 1;
                break;
              }
            }
          }
        }
      }

      // set currPlayTime and currSlideIndex
      setCurrPlayTime(time) {
        this.currPlayTime = time;
        this.resetCurrSlideIndex();
      }
    }

    return SlidesList;
  };

  /**
   * [player description]
   * @return {[type]} [description]
   *
   * <div sc-talk-player talk="talk"></div>
   */
  let player = function(scTalkPlayerSlidesList, Util, $sce, $timeout, Auth) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        slides: '=',
        talk: '='
      },
      templateUrl: 'templates/scTalkPlayer.html',
      controller: function($scope) {
        $scope.trustedAudioSrc = (src) => {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.isMobile = Util.isMobile();
        $scope.waiting = !$scope.isMobile; // in mobile initially as false
      },
      link: function(scope, element) {
        const currentUser = Auth.getCurrentUser(),
              nickname = currentUser && currentUser.attributes ? currentUser.attributes.nickname : '';
        let slidesList, player;

        slidesList = new scTalkPlayerSlidesList(scope.slides, {
          onPlay(sList) {
            scope.currentSlide = sList.getCurrSlide();
          }
        });

        scope.$on('$destroy', () => {
          if (slidesList.syncTimer) {
            $timeout.cancel(slidesList.syncTimer);
          }
        });

        // function onPlay(sList) {
        //   console.log('played at: ' + ((+new Date()) - startedAt));
        //   console.log('current time: ' + sList.currPlayTime);
        // }

        setTimeout(function() {
          player = new MediaElementPlayer('#player', {
            audioWidth: scope.isMobile ? $(window).width() : 600,
            audioHeight: 40,
            features: ['playpause', 'progress', 'current', 'duration'],
            alwaysShowHours: true,
            success: function(mediaEle) {
              function _logTime() {
                console.log('currentTime: ' + mediaEle.currentTime);
                console.log('slidesList currPlayTime: ' + parseInt(slidesList.currPlayTime / 1000));
              }

              let listen_duration, startTime, endTime;

              mediaEle.addEventListener('playing', () => {
                console.log('playing');
                scope.$apply(() => scope.waiting = false);
                if (slidesList.currPlayTime) {
                  slidesList.resume(mediaEle.currentTime * 1000);
                  _logTime();
                } else {
                  slidesList.play();
                }

                startTime = Date.now();

                // GA track
                ga('send', 'event', `group_name:${scope.talk.attributes.name}, group_id:${scope.talk.id}`, 'play_audio', `user_nickname:${nickname}, user_id:${currentUser ? currentUser.id : 'n/a'}`);
              });

              // mediaEle.addEventListener('loadeddata', () => {
              //   scope.$apply(() => scope.waiting = false);
              // });
              mediaEle.addEventListener('pause', () => {
                slidesList.pause(mediaEle.currentTime * 1000);
                endTime = Date.now();
                listen_duration = Math.round((endTime - startTime) / 1000);
                console.log('duration is ' + listen_duration + ' seconds.');

                // GA for listen_duration
                ga('send', 'event', `group_name:${scope.talk.attributes.name}, group_id:${scope.talk.id}`, 'send_listen_duration', `user_nickname:${nickname}, user_id:${currentUser ? currentUser.id : 'n/a'}`, listen_duration);
              });
              mediaEle.addEventListener('ended', () => {
                console.log('ended');
                slidesList.stop();
              });
              mediaEle.addEventListener('seeked', () => {
                scope.$apply(() => {
                  slidesList.pause(mediaEle.currentTime * 1000);
                  scope.waiting = false;
                  scope.currentSlide = slidesList.getCurrSlide();
                  _logTime();
                });
              });
              mediaEle.addEventListener('seeking', () => {
                slidesList.pause(mediaEle.currentTime * 1000);
                scope.$apply(() => scope.waiting = true);
                console.log('seeking');
              });
              // mediaEle.addEventListener('waiting', () => {
              //   console.log('waiting');
              // });
              mediaEle.addEventListener('canplay', () => {
                scope.$apply(() => scope.waiting = false);
              });
            }
          });
        }, 500);
      }
    };
  };

  angular.module('AiliBot').factory('scTalkPlayerSlidesList', SlidesListFactory);
  angular.module('AiliBot').directive('scTalkPlayer', player);
})();
