'use strict';

var app = angular.module('paranoid');

app.factory('crypto', require('./crypto'));
app.factory('requestQueue', require('./requestQueue'));