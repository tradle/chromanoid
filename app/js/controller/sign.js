module.exports = function($scope, $location, $timeout, requests, AccountService) {
  $scope.send = function() {
    var model = $scope.req;
    $scope.req.submit({
      doc: model.doc,
      sig: model.sig
    });

    nextOrHome();
  }

  $scope.sign = function() {
    var model = $scope.req;
    var account = AccountService.withAlias(model.alias);

    $scope.signing = true;
    $timeout(function() {
      var doc = model.doc;
      try {
        // remove JSON formatting whitespace before signing
        doc = JSON.parse(doc);
        doc = JSON.stringify(doc);
      } catch (err) {
        // guess it wasn't JSON
      }

      if (!account.mnemonic) account.setMnemonic(model.mnemonic);

      model.sig = account.sign(doc);
      $scope.signing = false;
    }, 50);
  }

  $scope.cancel = function() {
    $scope.req.cancel();
    nextOrHome();
  };

  $scope.skip = function() {
    throw new Error('unimplemented'); // requeue the current req
    // reqs.enqueue();
  }

  $scope.validateMnemonic = function() {
    var model = $scope.req;
    var account = $scope.account;
    $scope.error = null;
    $scope.mnemonicValid = account.validateMnemonic(model.mnemonic);
    if ($scope.mnemonicValid) {
      // if the account doesn't have a mnemonic, accept the mnemonic
      $scope.mnemonicVerified = !account.mnemonic || account.verifyMnemonic(model.mnemonic);
    }

    if (!$scope.mnemonicValid) $scope.error = 'Invalid mnemonic';
    else if (!$scope.mnemonicVerified) $scope.error = 'Input mnemonic differs from account mnemonic';
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    var model = $scope.req = requests.next('sign');
    if (!model) return false;

    $scope.account = AccountService.withAlias(model.alias);

    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) {

      $location.path('/');
    }
  }

  next();
}
