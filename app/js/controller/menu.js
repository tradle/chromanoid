module.exports = function($scope, $element, $location, requests) {
  var menu = $scope.menu = [
    {
      icon: 'home',
      path: 'home',
      tooltip: 'Home'
    },
    {
      icon: 'edit',
      path: 'sign',
      tooltip: 'Sign a document'
    },
    {
      icon: 'lock',
      path: 'encrypt',
      tooltip: 'Encrypt/decrypt'
    },
    {
      icon: 'trash',
      path: 'forget',
      tooltip: 'Forget cached keys'
    }
  ];

  requests.listen(updateCounts.bind(null, true));

  $scope.check = function($event) {
    switch (this.item.path) {
      case 'home':
      /* fall through */
      case 'forget':
        $location.path('/' + this.item.path);
        return;
    }

    if (!this.item.count) $event.preventDefault();
  }

  function updateCounts(apply) {
    menu.forEach(function(item) {
      item.count = requests.counts[item.path];
    })

    if (apply) $scope.$apply();
  }

  updateCounts();

  // TODO: get rid of this, and use ui-bootstrap + ui.bootstrap.tooltip
  $scope.$watch(function() {
    $element.find('[data-toggle="tooltip"]').tooltip();
  })
}