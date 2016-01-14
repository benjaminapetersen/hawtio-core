/// <reference path="corePlugin.ts"/>

module HawtioCore {
  
  export class BreadcrumbsController {

    constructor(public $router, public $location) {
      $router.subscribe((args) => {
        log.debug("subscribe, args: ", args);
        log.debug("$location.path: ", $location.path());
      });
    }
  }

  _module.component('hawtioBreadcrumbs', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'breadcrumbs.html'),
    controller: ['$router', '$location', BreadcrumbsController],
    controllerAs: 'breadcrumbs'
  });

}
