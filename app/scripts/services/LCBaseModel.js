'use strict';

{
  const Factory = () => {
    class LCBaseModel {
      constructor() {

      }
    }

    return LCBaseModel;
  };

  angular.module('AiliBot').factory('LCBaseModel', Factory);
}
