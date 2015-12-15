/// <reference path="common.ts"/>

module HawtioCorePrivate {

  var pluginName = "private-controller-plugin-1";
  var log = Logger.get(pluginName);

  var _module = <any> angular.module(pluginName, []);

  _module.run(['$router', ($router) => {
    $router.config([
      {
        path: '/private-controller-plugin-1',
        component: 'private-controller-1',
        as: 'PrivateController1'
      }
    ]);
  }]);

  export class PrivateController1 {
    constructor() {
      log.debug("Private controller 1");
    } 
  }

  _module.component('privateController1', {
    restrict: 'EA',
    templateUrl: urljoin(templatePath, 'private-controller-1.html'),
    controller: [PrivateController1]
  });


  hawtioPluginLoader.addModule(pluginName);

}
