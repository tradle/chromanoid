module.exports = function($scope, $location, $timeout, requests, crypto) {
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

      model.sig = crypto.sign(doc, model.mnemonic);
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
    $scope.mnemonicValid = model.mnemonic && crypto.validateMnemonic(model.mnemonic);
    $scope.error = !model.mnemonic || $scope.mnemonicValid ? null :'Please enter a valid mnemonic';
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    $scope.req = requests.next('sign');
    var model = $scope.req;
    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);

    $scope.req = model;
    $scope.title = 'Do you wish to sign the following document?';
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) {

      $location.path('/home');
    }
  }

  next();
}