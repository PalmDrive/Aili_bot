/**
 * [description]
 * @return {[type]} [description]
 *
 * <div class="sc-alert">
 *   <div class="sc-alert-spinner"></div>
 *   <div class="sc-alert-message">Save successfully.</div>
 *   <button class=""></button>
 * </div>
 */

(function() {
  'use strict';

  var module = angular.module('yw.alert', []);

  module.service('ywAlert', function($compile, $rootScope, $timeout) {
    this._cachedAlertElements = {};

    /**
     * Create and show the alert and
     * @param  {Object} alert
     * @param  {String} alert.message
     * @param  {String='error', 'success', 'warning'} [alert.type]
     * @param  {String} [alert.id]
     * @param  {Object} options
     * @return {DOM}    $alertElem
     */
    this.create = function(alert, options) {
      var defaults = {
            alert: {
              id: 'yw-alert-' + (+new Date()),
              type: 'success'
            },
            options: {
              last: 3000,
              container: 'body'
            }
          },
          newScope = $rootScope.$new(),
          $alertElem;

      alert = _.extend(defaults.alert, alert);
      options = _.extend(defaults.options, options || {});

      newScope.alert = alert;
      $alertElem = $('<yw-alert alert="alert"></yw-alert>').attr(alert);

      $(options.container).append($alertElem);

      // Without $timeout
      // when create called outside angular digest loop
      // the scope is not bind to the directive
      $timeout(function() {
        $alertElem = $($compile($alertElem)(newScope)[0]);
        this._cachedAlertElements[alert.id] = $alertElem;
      }.bind(this), 0);

      // By default dismiss in 3 seconds
      $timeout(function() {
        this.close(alert.id);
      }.bind(this), options.last);
    };

    this.close = function(alertId) {
      this._cachedAlertElements[alertId].remove();
      delete this._cachedAlertElements[alertId];
    };
  });

  module.directive('ywAlert', function(ywAlert) {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        alert: '='
      },
      template: '<div class="yw-alert yw-alert-{{alert.type}}">\
                  <div class="yw-alert-header"></div>\
                  <div class="yw-alert-message">{{alert.message}}</div>\
                  <button type="button" class="yw-alert-close" ng-click="close()">x</button>\
                </div>',
      link: function(scope, element, attr) {
        scope.close = function() {
          ywAlert.close(attr.id);
        };
      }
    };
  });
})();
