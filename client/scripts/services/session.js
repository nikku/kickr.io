'use strict';

angular.module('kickr')
  .factory('Session', function ($resource) {
    return $resource('/api/session/');
  });
