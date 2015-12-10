/// <reference path="loader.ts"/>

module HawtioCore {

  // Hawtio core plugin responsible for bootstrapping a hawtio app
  export var _module = angular.module(HawtioCore.pluginName, []);

  _module.config(["$locationProvider", function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }]);

  _module.run(['documentBase', function (documentBase) {
    log.debug("loaded");
  }]);

  hawtioPluginLoader.addModule("ng");
  hawtioPluginLoader.addModule("ngSanitize");
  hawtioPluginLoader.addModule(HawtioCore.pluginName);
}


