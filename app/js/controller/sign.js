module.exports = function($scope, $location, $timeout, requestQueue, crypto) {
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
    model.sig = crypto.sign(model.doc, model.mnemonic);
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
  }

  function clearError() {
    $scope.error = null;
  }

  function next() {
    var nextReq = requestQueue.dequeue('sign');
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