module.exports = function($scope, $location, reqs, crypto) {
  $scope.$on('$viewContentLoaded', onload);

  $scope.send = function() {
    var model = $scope.req;
    $scope.callback({
      doc: model.doc,
      sig: model.sig
    });

    nextOrHome();
  }

  $scope.encrypt = function() {
    var model = $scope.req;
    if (!model.mnemonic) {
      model.error = 'Please enter a passphrase';
      $timeout(clearError, 5000);
    }
    else {
      try {
        model.ciphertext = crypto.encrypt(model.doc, model.mnemonic);
      } catch (err) {
        $scope.error = err.message;
      }
    }
  }

  $scope.cancel = function() {
    $scope.callback({
      error: {
        code: -1,
        message: 'User refused to encrypt document'
      }
    });

    nextOrHome();
  };

  $scope.skip = function() {
    throw new Error('unimplemented'); // requeue the current req
    // reqs.enqueue();
  }

  function clearError() {
    $scope.error = null;
  }

  function onload() {
    // Run after view loaded.
    console.log('ENCRYPT VIEW LOADED');
    next();
  }

  function next() {
    var nextReq = reqs.dequeue('encrypt');
    if (!nextReq) return false;

    var model = nextReq.data;
    if (typeof model.doc === 'object') model.doc = JSON.stringify(model.doc, null, 2);

    $scope.callback = nextReq.callback;
    $scope.req = model;
    $scope.title = 'Please review the document below';
  }

  function nextOrHome() {
    $scope.req = null;
    if (next() === false) $location.path('/home');
  }
}