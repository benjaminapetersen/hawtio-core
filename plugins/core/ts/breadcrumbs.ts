/// <reference path="corePlugin.ts"/>

module HawtioCore {
  
  export class BreadcrumbsController {

    public paths = [];

    constructor(public $router, public $location) {

      $router.subscribe((args) => {
        log.debug("subscribe, args: ", args);
        log.debug("$location.path: ", $location.path());
        this.paths.length = 0;
        var fullPath = '';
        _.forEach($location.path().split('/'), (path) => {
          if (path === '') {
            fullPath = urljoin(fullPath, '/');
            this.paths.push({
              name: 'Home',
              href: '/'
            });
          } else {
            fullPath = urljoin(fullPath, path);
            this.paths.push({
              name: path,
              href: urljoin(fullPath, path)
            })
          }
        });
        log.debug("Paths: ", this.paths);
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
