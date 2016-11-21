(function() {
  'use strict';

  var dir = function($timeout) {
    function linkFn(scope, element, attrs, ctrls) {
      var scrollCtrl = ctrls[0],
          jsScrolling = !scrollCtrl.isNative(),
          isLoading = false,
          scrollMaxBefore, scrollMaxAfter;

      if (!jsScrolling) {
        // grabbing the scrollable element, to determine dimensions, and current scroll pos
        var scrollEl = ionic.DomUtil.getParentOrSelfWithClass($element[0].parentNode, 'overflow-scroll');
      }

      function _checkInfiniteBounds() {
        if (isLoading) { return };
        var maxScroll = {},
            distance = parseInt(attrs.distance) || 5;

        if (jsScrolling) {
          var scrollValues = scrollCtrl.scrollView.getValues();
          if (scrollValues.top <= distance) {
            scrollMaxBefore = scrollCtrl.scrollView.getScrollMax().top;
            _onInfinite();
          }
        } else {
          if (scrollEl.scrollTop <= distance) {
            _onInfinite();
          }
        }
      };

      function _onInfinite() {
        ionic.requestAnimationFrame(function() {
          element[0].classList.add('active');
        });
        isLoading = true;
        scope.$parent && scope.$parent.$apply(attrs.onInfinite || '');
      }

      function _finishInfiniteScroll() {
        ionic.requestAnimationFrame(function() {
          element[0].classList.remove('active');
        });
        $timeout(function() {
          if (jsScrolling) {
            scrollCtrl.scrollView.resize();
            scrollMaxAfter = scrollCtrl.scrollView.getScrollMax().top;

            // scroll to the previous position
            if (scrollMaxAfter > scrollMaxBefore) {
              scrollCtrl.scrollView.scrollTo(0, scrollMaxAfter - scrollMaxBefore, false);
            }
          }
          // only check bounds again immediately if the page isn't cached (scroll el has height)
          if ((jsScrolling && scrollCtrl.scrollView.__container && scrollCtrl.scrollView.__container.offsetHeight > 0) ||
          !jsScrolling) {
            _checkBounds();
          }
        }, 30, false);
        isLoading = false;
      }

      var _checkBounds = ionic.Utils.throttle(_checkInfiniteBounds, 300);

      scrollCtrl.$element.on('scroll', _checkBounds);

      scope.$on('scroll.infiniteScrollComplete', function() {
        _finishInfiniteScroll();
      });

      scope.$on('$destroy', function() {
        if (scrollCtrl && scrollCtrl.$element) scrollCtrl.$element.off('scroll', _checkBounds);
        if (scrollEl && scrollEl.removeEventListener) {
          scrollEl.removeEventListener('scroll', _checkBounds);
        }
      });
    }

    return {
      restrict: 'E',
      scope: true,
      require: ['?^$ionicScroll'],
      template: function($element, $attrs) {
        if ($attrs.icon) return '<div class="loader"><i class="icon {{icon()}} icon-refreshing {{scrollingType}}"></i></div>';
        return '<div class="loader"><ion-spinner icon="{{spinner()}}"></ion-spinner></div>';
      },
      link: linkFn
    };
  };

  angular.module('AiliBot').directive('infiniteScrollTop', dir);
})();
