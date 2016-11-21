(function() {
  'use strict';

  function _base64ToArrayBuffer(base64) {
    var bytes = _base64ToArray(base64);
    return bytes.buffer;
  }

  // Create a typed array out of the array buffer representing each character from as a 8-bit unsigned integer
  function _base64ToArray(base64) {
    var binaryString =  window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function _dataURItoBlob(dataURI) {
    // Split the input to get the mime-type and the data itself
    dataURI = dataURI.split( ',' );

    // First part contains data:audio/ogg;base64 from which we only need audio/ogg
    var type = dataURI[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];

    // Second part is the data itself and we decode it
    var intArray = _base64ToArray( dataURI[ 1 ] );

    return new Blob( [ intArray ], {type: type} );
  }

  function _playSound(buffer, AudioContext) {
    var source = AudioContext.createBufferSource();

    source.buffer = buffer;
    source.connect(AudioContext.destination);
    //source.loop = true;
    source.start(0);

    return source;
  }

  angular.module('AiliBot').factory('WebAudio', function($q, AudioContext) {
    /**
     * WebAudio class deals with browsers compatibility issue. It will play the sound in different ways
     *
     * @param {DOMElement} elem         the audio element
     * @param {Integer} type
     * - 0: use buffer source node to control the sound playback
     * - 1: use objectURL as the src
     *
     */
    var WebAudio = function(elem, options, type) {
      this.elem = elem;
      this.AudioContext = AudioContext;
      this.type = AudioContext ? (type || 0) : 2;
      this.options = options || {};
      return this;
    };

    WebAudio.prototype.init = function() {
      var _this = this,
          src = this.elem.getAttribute('ng-src');

      if (this.type !== 0) {
        this.elem.addEventListener('ended', function() {
          // execute onended callback
          _this.options.onended.call(_this);
        });
      }

      return $q(function(resolve) {
        switch(_this.type) {
          case 0:
            setTimeout(function() {
              var base64 = src.split(',')[1];

              // get the buffer
              AudioContext.decodeAudioData(_base64ToArrayBuffer(base64), function(buffer) {
                _this.buffer = buffer;
                resolve();
              });
            }, 500);

            break;
          case 1: // replace the src with objectURL
            _this.elem.src = URL.createObjectURL(_dataURItoBlob(src));
            resolve();
            break;
        }
      });
    };

    WebAudio.prototype.play = function() {
      var source = null,
          _this = this;

      switch (this.type) {
        case 0:
          source = _playSound(this.buffer, this.AudioContext);
          source.onended = function() {
            _this.options.onended.call(_this);
          };
          break;
        default:
          this.elem.play();
      }

      this.source = source;

      return source;
    };

    WebAudio.prototype.stop = function() {
      switch (this.type) {
        case 0:
          this.source.stop(0);
          break;
        default:
          this.elem.pause();
          this.elem.currentTime = 0;
      }
    };

    return WebAudio;
  });
})();
