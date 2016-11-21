(function() {
  'use strict';

  function _storageAvailable(type) {
    try {
      var storage = window[type],
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return false;
    }
  }

  var LocalStorage = function() {
    var _namespace = 'AiliBot';

    this.isAvailable = _storageAvailable('localStorage');

    this.set = function(key, data) {
      if (this.isAvailable) {
        localStorage.setItem(_namespace + ':' + key, JSON.stringify(data));
        return data;
      }
    };

    this.get = function(key) {
      if (this.isAvailable) {
        var data = localStorage.getItem(_namespace +
          ':' + key);

        if (data && data !== 'undefined') {
          return JSON.parse(data);
        }
      }
    };

    this.remove = function(key) {
      if (this.isAvailable) {
        localStorage.removeItem(_namespace + ':' + key);
      }
    };

    return this;
  };

  angular.module('AiliBot').service('LocalStorage', LocalStorage);
})();
