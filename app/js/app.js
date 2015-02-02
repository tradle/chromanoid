global.jQuery = global.$ = require('jquery');

require('bootstrap');
require('angular');
require('angular-route');

var app = angular.module('paranoid', [
  'ngRoute'
]);

require('./factory');
require('./controller');

app.config(function($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'templates/home.html', 
      controller: 'MainCtrl'
    })
    .when('/sign', {
      templateUrl: 'templates/sign.html',
      controller: 'SignCtrl'
    })
    .when('/encrypt', {
      templateUrl: 'templates/encrypt.html',
      controller: 'EncryptCtrl'
    })
    .when('/forget', {
      templateUrl: 'templates/forget.html',
      controller: 'ForgetCtrl'
    })
    .otherwise({redirectTo: '/home'});
})
.config( [
  '$compileProvider',
  function( $compileProvider ) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(chrome-extension):/);
  }
]);
// next()

global.handleRequest = require('./factory/requestQueue')().enqueue; // TODO: fix this