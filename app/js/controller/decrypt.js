module.exports = function($scope, $location, $timeout, requests, crypto) {
  $scope.send = function() {
    var model = $scope.req;
    $scope.req.submit({
      doc: model.doc,
      ciphertext: model.ciphertext
    });

    nextOrHome();
  }

  $scope.decrypt = function() {
    var model = $scope.req;

    $scope.decrypting = true;
    $timeout(function() {
      model.ciphertext = crypto.decrypt(model.doc, model.mnemonic);
      $scope.decrypting = false;
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
    $scope.mnemonicValid = model.mnemonic && crypto.validateMnemonic(model.mnemonic);
    $scope.error = !model.mnemonic || $scope.mnemonicValid ? null :'Please enter a valid mnemonic';
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    $scope.req = requests.next('decrypt');
    var model = $scope.req;
    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);

    $scope.req = model;
    $scope.title = 'Do you wish to decrypt the following document?';
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) {

      $location.path('/');
    }
  }

  next();
}