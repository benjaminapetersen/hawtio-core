/// <reference path="corePlugin.ts"/>

module HawtioCore {

  export class MainController {
    constructor($router) {
      log.debug("Main controller");
    }
  }

  export class HomeController {
    public $routeConfig = [];
    constructor($router) {
      log.debug("Home controller");

    }
  }

  _module.component('home', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'home.html'),
    controller: ['$router', HomeController]
  });
  
  _module.component('main', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'main.html'),
    controller: ['$router', MainController]
  });
}
