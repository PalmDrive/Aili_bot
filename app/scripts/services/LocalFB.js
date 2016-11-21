'use strict';

/**
 * A local copy of the firebase data structure
 */
(function() {
  var LocalFB = {
    _store: {},

    /**
     * Save the new data to the specified path
     *
     * @param {String} path  e.x. users/user_id
     * @param {Object|String|Number} value
     */
    _set: function(path, value) {
      // remove the tailling '/'
      path = path.replace(/\/$/, '');

      var pathArray = path.split('/'),
          lastPath = pathArray.pop(),
          previousPath = pathArray.join('/'),
          ref = previousPath === '' ? this._store : this.get(previousPath);

      if (ref === null) {
        throw new Error('the value of ' + previousPath + ' is null');
      } else if (!_.isObject(ref) || _.isArray(ref)) {
        throw new Error('the value of ' + previousPath + ' is ' + ref + '. It should be hash map.');
      } else {
        ref[lastPath] = value;
        return ref;
      }
    },

    _getParentPath: function(path) {
      if (!path || !path.match(/\//)) {
        return path;
      }

      var pathArray = path.split('/'),
          parentPath = pathArray.slice(0, pathArray.length).join('/');

      return parentPath;
    },

    /**
     * Save the new data to the specified path,
     * no matter if the previous path exists or not.
     * So it is less strict than _set method
     *
     * @param {String} path  e.x. users/user_id
     * @param {Object|String|Number} value
     */
    set: function(path, value) {
      // remove the tailling '/'
      path = path.replace(/\/$/, '');

      var pathArray = path.split('/'),
          _this = this,
          currentPath = '',
          ref;

      _.each(pathArray, function(p, i) {
        currentPath += p + '/';
        ref = _this.get(currentPath);
        if (!_.isObject(ref) || _.isArray(ref)) {
          if (i === pathArray.length - 1) {
            _this._set(currentPath, value);
          } else {
            _this._set(currentPath, {});
          }
        }
      });

      return this.get(this._getParentPath(path));
    },

    /**
     * Update the new data to the specified path
     *
     * @param {String} path  e.x. users/user_id
     * @param {Object|String|Number} value
     */
    update: function(path, value) {
      // remove the tailling '/'
      path = path.replace(/\/$/, '');

      var ref = this.get(path);

      if (ref === null) {
        throw new Error('the value of ' + path + ' is null');
      } else if (!_.isObject(ref) || _.isArray(ref)) {
        var parentPath = this._getParentPath(path);

        this.set(parentPath, value);
      } else {
        if (!_.isObject(value)) {
          throw new Error('value should be hash map');
        }
        _.extend(ref, value);
        return ref;
      }
    },

    get: function(path, ref) {
      if (path === '') {
        return ref;
      }

      if (ref === null || typeof ref === 'undefined') {
        ref = LocalFB._store;
      }

      // remove the tailling '/'
      //path = path.replace(/\/$/, '');

      var pathArray = path.split('/'),
          firstPath = pathArray.shift(),
          nextRef;

      if (ref.hasOwnProperty(firstPath)) {
        nextRef = ref[firstPath];
        return this.get(pathArray.join('/'), nextRef);
      } else {
        return null;
      }
    }
  };

  angular.module('AiliBot').factory('LocalFB', function() {
    return LocalFB;
  });

})();
