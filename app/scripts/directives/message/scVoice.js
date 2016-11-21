(function() {
  'use strict';

  function formatDuration(duration) {
    var minutes = parseInt(duration / 60).toString(),
        seconds = (duration % 60).toString();

    if (seconds.length === 1) {
      seconds = '0' + seconds;
    }

    return [minutes, ':', seconds].join('');
  }

  var VoiceLoadingTracker = function() {
    this._initTime = new Date().getTime();
  };

  VoiceLoadingTracker.prototype.send = function(length) {
    // downloading time vs voice length
    var data = (new Date().getTime() - this._initTime) / 1000 / length;
    data = Math.ceil(data * 100) / 100;
    ga('send', 'timing', 'voice downloading duration', 'downloading time vs voice length', data);
  };

  var dir = function(FirebaseRef, $interval, WebAudio, $sce, VoiceAutoPlay, Auth) {
    return {
      restrict: 'EA',
      templateUrl: 'templates/scVoice.html',
      scope: {
        model: '='
      },
      link: function(scope, element) {
        var audio = element[0].getElementsByTagName('audio')[0],
            manuallyStopping = false,
            sentFromSpeaker = scope.model.user.status === 0,
            isCurrentUserSpeaker = scope.model.isAuthor && sentFromSpeaker,
            isNewMessage = VoiceAutoPlay.batch.lastMessage && VoiceAutoPlay.batch.lastMessage.createdAt < scope.model.createdAt,
            $messageElem = $(element[0]).parents('.sc-message-view'),
            voiceMessagesRef = FirebaseRef.child(scope.model.content),
            webAudio,
            loop;

        var voiceLoadingTracker = new VoiceLoadingTracker();

        scope.playing = false;
        scope.frameIndex = 3;

        function clearLoop() {
          if (angular.isDefined(loop)) {
            $interval.cancel(loop);
            scope.frameIndex = 3;
            loop = undefined;
          }
        }

        // When the sound stops playing, end or stop manually
        function voicePlayOnEnded() {
          clearLoop();
          scope.playing = false;
          scope.$apply();

          // check if the $messageElem is the same as VoiceAutoPlay.lastPlayed.msgEl
          if ($messageElem.attr('id') === VoiceAutoPlay.lastPlayed.msgEl.attr('id')) {
            VoiceAutoPlay.lastPlayed.isPlaying = false;
          }

          if (!manuallyStopping && VoiceAutoPlay.batch.loaded && sentFromSpeaker) {
            // find the next unread voice message and auto
            VoiceAutoPlay.findNextAndPlay($messageElem);
          }

          manuallyStopping = false;
        }

        audio.onloadedmetadata = function() {
          scope.loaded = true;
          scope.voiceLength = formatDuration(Math.round(this.duration));
          scope.$digest();

          voiceLoadingTracker.send(this.duration);

          webAudio = new WebAudio(audio, {
            onended: voicePlayOnEnded
          });

          webAudio.init().then(function() {
            // If it is a speaker voice message and no voice message is playing, auto play it
            if (sentFromSpeaker && !VoiceAutoPlay.lastPlayed.isPlaying && isNewMessage && !isCurrentUserSpeaker) {
              scope.togglePlay();
            }

            // @todo: prob not used any more. can be removed
            if (VoiceAutoPlay.batchLoaded(scope.model)) {
              VoiceAutoPlay.batch.loaded = true;
            }
          });
        };

        // @todo: fetch voice data when starting to play?
        voiceMessagesRef.on('value', function(snap) {
          var val = snap.val();
          if (val) {
            // once fetched the data, detach the listener
            voiceMessagesRef.off('value');

            scope.voiceData = $sce.trustAsResourceUrl('data:audio/aac;base64,' + snap.val());
            scope.$digest();
          }
        });

        scope.$on('$destroy', function() {
          clearLoop();
          voiceMessagesRef.off('value');
        });

        scope.$on('scMessage:stopVoicePlay', function() {
          if (scope.playing) {
            scope.togglePlay();
          }
        });

        scope.togglePlay = function() {
          if (!scope.loaded) {
            return;
          }

          if (scope.playing) {
            manuallyStopping = true;
            webAudio.stop();
          } else {
            VoiceAutoPlay.findPreviousAndStop();

            webAudio.play();

            if (!scope.model.isHeard) {
              scope.model.setIsHeard();
            }

            VoiceAutoPlay.lastPlayed.msgEl = $messageElem;

            VoiceAutoPlay.lastPlayed.isPlaying = true;

            // animiate the voice icons
            loop = $interval(function() {
              scope.frameIndex = scope.frameIndex % 3 + 1;
            }, 500);
          }

          scope.playing = !scope.playing;
        };
      }
    };
  };

  angular.module('AiliBot').directive('scVoice', dir);
})();
