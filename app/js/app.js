global.jQuery = global.$ = require('jquery');

require('bootstrap');
require('angular');
require('angular-route');
// require('ng-storage');
var app = angular.module('paranoid', [
  'ngRoute'
]);

require('./factory');
require('./controller');

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/home.html',
      controller: 'MainCtrl'
    })
    .when('/accounts', {
      templateUrl: 'templates/accounts.html',
      controller: 'AccountsCtrl'
    })
    .when('/accounts/:id', {
      templateUrl: 'templates/account.html',
      controller: 'AccountCtrl'
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
    .otherwise({redirectTo: '/'});
  })
  .config( [
    '$compileProvider',
    function( $compileProvider ) {
      $compileProvider.aHrefSanitizationWhitelist(/^\s*(chrome-extension):/);
    }
  ])
  .factory('$exceptionHandler', function () {
    return function errorCatcherHandler(exception, cause) {
      debugger;
      console.error(exception.stack);
    };
  });

(function() {
  var $q = angular.injector(['ng']).get('$q');
  var ready = $q.defer();
  window.appReady = ready.promise;
  chrome.storage.local.get('accounts', function(result) {
    app.constant('APP_CONF', {
      accounts: (result.accounts || [])
    });

    angular.element(document).ready(function() {
      angular.bootstrap(document, ['paranoid']);
      ready.resolve();
    });
  });
})();

global.handleRequest = require('./factory/requests')().enqueue;
