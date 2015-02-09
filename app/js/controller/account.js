module.exports = function($scope, $location, $routeParams, AccountService) {
  $scope.account = AccountService.withId($routeParams.id);
  $scope.alias = $scope.account.alias;
  $scope.mnemonic = $scope.account.mnemonic;

  $scope.save = function() {
    $scope.account.setMnemonic($scope.mnemonic);
    $scope.account.alias = $scope.alias;
    $scope.error = $scope.warning = null;
    AccountService.save();
    back();
  }

  $scope.cancel = back;
  $scope.delete = function() {
    AccountService.remove($scope.account);
    back();
  }

  $scope.generateMnemonic = function() {
    $scope.mnemonic = $scope.account.generateMnemonic();
    $scope.validateMnemonic();
  }

  $scope.validateMnemonic = function() {
    $scope.error = $scope.mnemonic && 
      !$scope.account.validateMnemonic($scope.mnemonic) && 
      'Please enter a valid mnemonic or generate a fresh one by clicking above';

    $scope.warning = $scope.mnemonic && 
      $scope.account.isNew &&
      !$scope.error && 
      'Write down this mnemonic in a safe place, as it will be erased the moment you close this program';
  }

  function back() {
    $location.path('/accounts');
  }

  $scope.validateMnemonic();
}