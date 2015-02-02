module.exports = function($scope, $location, reqs, crypto) {
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
    if (!model.mnemonic) {
      model.error = 'Please enter a passphrase';
      $timeout(clearError, 5000);
    }
    else {
      try {
        model.sig = crypto.sign(model.doc, model.mnemonic);
      } catch (err) {
        $scope.error = err.message;
      }
    }
  }

  $scope.cancel = function() {
    $scope.req.cancel();
    nextOrHome();
  };

  $scope.skip = function() {
    throw new Error('unimplemented'); // requeue the current req
    // reqs.enqueue();
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    var nextReq = reqs.dequeue('sign');
    if (!nextReq) return false;

    var model = nextReq;
    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);

    $scope.req = model;
    $scope.title = 'Do you wish to sign the following document?';
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) $location.path('/home');
  }

  next();
}