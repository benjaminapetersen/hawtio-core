/// <reference path="corePlugin.ts"/>

module HawtioCore {

  export class NavigationController {

    constructor(public $router, public $route, public $location) {

    }

  }

  _module.component('hawtioNavigation', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'navigation.html'),
    controller: ['$router', '$route', '$location', NavigationController],
    controllerAs: 'nav'
  });


}
