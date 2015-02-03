'use strict';

var app = angular.module('paranoid');

app.controller('MainCtrl', require('./main'));
app.controller('MenuCtrl', require('./menu'));
app.controller('SignCtrl', require('./sign'));
app.controller('EncryptCtrl', require('./encrypt'));
app.controller('ForgetCtrl', require('./forget'));
