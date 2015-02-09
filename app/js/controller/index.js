'use strict';

var app = angular.module('paranoid');

app.controller('MainCtrl', require('./main'));
app.controller('MenuCtrl', require('./menu'));
app.controller('SignCtrl', require('./sign'));
app.controller('DecryptCtrl', require('./decrypt'));
app.controller('ForgetCtrl', require('./forget'));
app.controller('AccountsCtrl', require('./accounts'));
app.controller('AccountCtrl', require('./account'));
