/// <reference path="loader.ts"/>

module HawtioCore {

  // Hawtio core plugin responsible for bootstrapping a hawtio app
  export var _module = <any> angular.module(HawtioCore.pluginName, []);

  /*
  
   // Uncomment to dump out all the plugins and services at bootup

  _module.run(() => {
    if (!log.enabledFor(Logger.DEBUG)) {
      return;
    }
    setTimeout(() => {
      var plugins = _.filter(hawtioPluginLoader.getModules(), (module) => angular.isString(module));
      var getServices = (module:string, answer:any) => {
        if (!answer) {
          answer = <any> {};
        }
        _.forEach(angular.module(module).requires, (m) => getServices(m, answer));
        _.forEach((<any>angular.module(module))._invokeQueue, (a) => {
          try {
            answer[a[2][0]] = injector.get(a[2][0]);
          } catch (err) {
            //nothing to do
          }
        });
        return answer;
      }
      var services = {};
      _.forEach(plugins, (plugin:string) => plugin ? getServices(plugin, services) : log.debug("null plugin name"));
      log.debug("Plugins: ", plugins.join(', '));
      log.debug("Services: ");
      _.forIn(services, (service, key) => {
        log.debug("  " + key + ": ", service);
      });
      log.debug("Injector: ", injector);
    }, 50);
  });
  */

  _module.run(['documentBase', '$router', (documentBase, $router) => {
    $router.config([
      {
        path: '/',
        component: 'home',
        as: 'Home'
      }
    ]);
    log.debug("Loaded");
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


