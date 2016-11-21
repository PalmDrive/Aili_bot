'use strict';

{
  angular.module('AiliBot').factory('LeanCloud', (LEAN_CLOUD) => {
    AV.init({
      appId: LEAN_CLOUD.appId,
      appKey: LEAN_CLOUD.appKey
    });
    return AV;
  });
}
