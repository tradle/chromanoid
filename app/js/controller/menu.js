var menu = [
  {
    icon: 'home',
    path: '/',
    tooltip: 'Home'
  },
  {
    icon: 'edit',
    path: '/sign',
    tooltip: 'Sign a document'
  },
  {
    icon: 'lock',
    path: '/decrypt',
    tooltip: 'Encrypt/decrypt'
  },
  {
    icon: 'user',
    path: '/accounts',
    tooltip: 'Accounts'
  },
  {
    icon: 'trash',
    path: '/forget',
    tooltip: 'Forget cached keys'
  }
];

module.exports = function($scope, $element, $location, requests) {
  $scope.menu = menu;
  $scope.vertical = $location.path() === '/';

  requests.listen(updateCounts.bind(null, true));

  $scope.check = function($event) {
    switch (this.item.path) {
      case '/':
      /* fall through */
      case '/accounts':
      case '/forget':
        // $location.path(this.item.path);
        return;
    }

    if (!this.item.count) $event.preventDefault();
  }

  function updateCounts(apply) {
    menu.forEach(function(item) {
      item.count = requests.counts[item.path.slice(1)];
    })

    if (apply) $scope.$apply();
  }

  updateCounts();

  // TODO: get rid of this, and use ui-bootstrap + ui.bootstrap.tooltip
  $scope.$watch(function() {
    $element.find('[data-toggle="tooltip"]').tooltip();
  })
}