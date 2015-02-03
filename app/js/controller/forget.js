module.exports = function($scope, $timeout, $interval, $location, crypto) {
  $scope.forget = function() {
    crypto.clearCache();

    $scope.progress = 0;
    $interval(function() {
        $scope.progress++;
      }, 10, 100)
      .then(function() {
        $timeout(function() {
          $scope.forgotten = true;
        }, 500);
      })
  };
}