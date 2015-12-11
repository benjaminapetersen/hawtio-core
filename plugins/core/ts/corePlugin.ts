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

  /* we also add our dependent modules here so that plugins don't need to specify them */
  // angular
  hawtioPluginLoader.addModule("ng");
  hawtioPluginLoader.addModule("ngSanitize");
  hawtioPluginLoader.addModule("ngAnimate");

  // new router
  hawtioPluginLoader.addModule("ngComponentRouter");
  // shim for old code
  hawtioPluginLoader.addModule("ngRouteShim");

  // angular-bootstrap
  hawtioPluginLoader.addModule("ui.bootstrap");

  // angular-patternfly
  hawtioPluginLoader.addModule("patternfly");
  hawtioPluginLoader.addModule("patternfly.charts");

  // and now the core plugin that's used to bootstrap the app in loader.ts
  hawtioPluginLoader.addModule(HawtioCore.pluginName);
}


