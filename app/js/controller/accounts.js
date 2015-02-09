module.exports = function($scope, $location, AccountService) {
  $scope.account = {};
  $scope.accounts = AccountService.accounts();
  
  $scope.add = function() {
    var account = AccountService.add($scope.account.alias);
    $location.path('/accounts/' + account.id);
  }

  $scope.remove = function(account) {
    AccountService.remove(account);
  }

  $scope.validateAlias = function() {
    var alias = $scope.account.alias;
    $scope.aliasIsNew = alias && $scope.accounts.every(function(account) {
      return account.alias !== alias;
    });

    $scope.aliasIsValid = alias && /[a-zA-Z0-9]{1,}/.test(alias);
  }
}