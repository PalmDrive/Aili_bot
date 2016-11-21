(function() {
  'use strict';

  /**
   * <div sc-background-container data-background-image="" data-ratio=""></div>
   */

  angular.module('AiliBot').directive('scBackgroundContainer', function() {
    return (scope, element, attrs) => {
      const $el = $(element[0]),
            height = $el.width() * (+attrs.ratio),
            opacity = +attrs.opacity || 1;

      $el.height(height);

      if (attrs.backgroundImage) {
        $el.css({
          'background-image': `url(${attrs.backgroundImage})`,
          'background-size': 'cover',
          opacity: opacity
        });
      }
    };
  });
})();
