/// <reference path="common.ts"/>

module HawtioCorePrivate {

  var pluginName = "private-controller-plugin-2";
  var log = Logger.get(pluginName);

  var _module = <any> angular.module(pluginName, []);

  _module.run(['$router', ($router) => {
    $router.config([
      {
        path: '/private-controller-plugin-2',
        component: 'private-controller-2',
        as: 'PrivateController2'
      }
    ]);
  }]);

  export class PrivateController2 {

    constructor() {
      log.debug("Private controller 2");
    } 
  }

  export class One {
    constructor() {
      log.debug("one");
    }   
  }

  export class Two {
    constructor() {
      log.debug("two");
    }
  }

  _module.component('privateController2', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'private-controller-2.html'),
    controller: PrivateController2,
    $routeConfig: [
      {
        path: '/',
        redirectTo: '/one'
      },
      {
        path: '/one',
        component: 'one',
        as: 'One'
      },
      {
        path: '/two',
        component: 'two',
        as: 'Two'
      }
    ]
  });

  _module.component('one', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'one.html'),
    controller: [One]
  });

  _module.component('two', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'two.html'),
    controller: [Two]
  });


  hawtioPluginLoader.addModule(pluginName);

}
