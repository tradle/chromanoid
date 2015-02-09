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
    var account = AccountService.withAlias(model.alias);
    $scope.mnemonicValid = model.mnemonic && account.validateMnemonic(model.mnemonic);
    $scope.error = !model.mnemonic || $scope.mnemonicValid ? null : 'Invalid mnemonic';
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    $scope.req = requests.next('sign');
    var model = $scope.req;
    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);

    $scope.req = model;
    $scope.title = 'Sign as ' + model.alias + '?';
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) {

      $location.path('/');
    }
  }

  next();
}