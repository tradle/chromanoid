
'use strict';

require('angular');
var app = angular.module('paranoid');

app.factory('crypto', require('./crypto'));
app.factory('Account', require('./account'));
app.factory('AccountService', require('./accounts'));
app.factory('requests', require('./requests'));
