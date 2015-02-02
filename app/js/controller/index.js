'use strict';

var app = angular.module('paranoid');

app.controller('MainCtrl', require('./main'));
app.controller('FooterCtrl', ['$scope', '$element', '$location', 'requestHandler', require('./footer')]);
app.controller('SignCtrl', ['$scope', '$location', 'requestHandler', 'crypto', require('./sign')]);
app.controller('EncryptCtrl', require('./encrypt'));
app.controller('ForgetCtrl', require('./forget'));
