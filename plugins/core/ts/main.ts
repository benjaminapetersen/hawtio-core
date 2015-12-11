/// <reference path="corePlugin.ts"/>

module HawtioCore {

  export class MainController {
    constructor($router) {
      log.debug("Hello world!");
      $router.config([
        {
          path: '/',
          component: 'home',
          as: 'Home'
        }
      ]);
    }
  }

  _module.component('main', {
    restrict: 'E',
    templateUrl: urljoin(templatePath, 'main.html'),
    controller: ['$router', MainController]
  });
}
