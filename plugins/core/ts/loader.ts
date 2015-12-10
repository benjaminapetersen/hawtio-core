/// <reference path="logger.ts"/>
/// <reference path="coreGlobals.ts"/>

module HawtioCore {

  var log = Logger.get('hawtio-loader');

  function intersection(search, needle) {
    if (!angular.isArray(needle)) {
      needle = [needle];
    }
    //log.debug("Search: ", search);
    //log.debug("Needle: ", needle);
    var answer = [];
    needle.forEach((n) => {
      search.forEach((s) => {
        if (n === s) {
          answer.push(s);
        }
      });
    });
    return answer;
  }

  export class PluginLoader {

    /**
     * List of URLs that the plugin loader will try and discover
     * plugins from
     * @type {Array}
     */
     private urls = [];

     /**
      * Holds all of the angular modules that need to be bootstrapped
      * @type {Array}
      */
      private modules = [];

      private loaderCallback = <any> null;

      /**
       * Tasks to be run before bootstrapping, tasks can be async.
       * Supply a function that takes the next task to be
       * executed as an argument and be sure to call the passed
       * in function.
       *
       * @type {Array}
       */
       private tasks = [];

       public constructor() {
         var self = this;
         this.setLoaderCallback({
           scriptLoaderCallback: (self, total, remaining) => {
             log.debug("Total scripts: ", total, " Remaining: ", remaining);
           },
           urlLoaderCallback: (self, total, remaining) => {
             log.debug("Total URLs: ", total, " Remaining: ", remaining);
           }
         });
       }

       public registerPreBootstrapTask(task:any, front?:boolean) {
         var tObj = task;
         var unnamed = 'unnamed-task-' + (this.tasks.length + 1)
         if (angular.isFunction(task)) {
           log.debug("Adding legacy task");
           tObj = {
             name: unnamed,
             task: task
           }
         }
         if (!task.name) {
           task.name = unnamed;
         }
         if (task.depends && !angular.isArray(task.depends) && task.depends !== '*') {
           task.depends = [task.depends];
         }
         if (!front) {
           this.tasks.push(tObj);
         } else {
           this.tasks.unshift(tObj);
         }
       };

       public addModule(module:string) {
         log.debug("Adding module: " + module);
         this.modules.push(module);
       }

       public addUrl(url) {
         log.debug("Adding URL: " + url);
         this.urls.push(url);
       }

       public getModules() {
         return this.modules;
       }


       public setLoaderCallback(cb) {
         this.loaderCallback = cb;
         // log.debug("Setting callback to : ", this.loaderCallback);
       };

       public loadPlugins(callback) {

         var lcb = this.loaderCallback;

         var plugins = {};

         var urlsToLoad = this.urls.length;
         var totalUrls = urlsToLoad;

         var bootstrap = () => {
           var executedTasks = [];
           var deferredTasks = [];

           var bootstrapTask = {
             name: 'Hawtio Bootstrap',
             depends: '*',
             runs: 0,
             task: (next) => {
               function listTasks() {
                 deferredTasks.forEach((task) => {
                   log.info("  name: " + task.name + " depends: ", task.depends);
                 });
               }
               if (deferredTasks.length > 0) {
                 log.info("tasks yet to run: ");
                 listTasks();
                 bootstrapTask.runs = bootstrapTask.runs + 1;
                 log.info("Task list restarted : ", bootstrapTask.runs, " times");
                 if (bootstrapTask.runs === 5) {
                   log.info("Orphaned tasks: ");
                   listTasks();
                   deferredTasks.length = 0;
                 } else {
                   deferredTasks.push(bootstrapTask);
                 }
               }
               log.debug("Executed tasks: ", executedTasks);
               next();
             }
           }

           this.registerPreBootstrapTask(bootstrapTask);

           var executeTask = () => {
             var tObj = null;
             var tmp = [];
             // if we've executed all of the tasks, let's drain any deferred tasks
             // into the regular task queue
             if (this.tasks.length === 0) {
               tObj = deferredTasks.shift();
             }
             // first check and see what tasks have executed and see if we can pull a task
             // from the deferred queue
             while(!tObj && deferredTasks.length > 0) {
               var task = deferredTasks.shift();
               if (task.depends === '*') {
                 if (this.tasks.length > 0) {
                   tmp.push(task);
                 } else {
                   tObj = task;
                 }
               } else {
                 var intersect = intersection(executedTasks, task.depends);
                 if (intersect.length === task.depends.length) {
                   tObj = task;
                 } else {
                   tmp.push(task);
                 }
               }
             }
             if (tmp.length > 0) {
               tmp.forEach((task) => {
                 deferredTasks.push(task);
               });
             }
             // no deferred tasks to execute, let's get a new task
             if (!tObj) {
               tObj = this.tasks.shift();
             }
             // check if task has dependencies
             if (tObj && tObj.depends && this.tasks.length > 0) {
               log.debug("Task '" + tObj.name + "' has dependencies: ", tObj.depends);
               if (tObj.depends === '*') {
                 if (this.tasks.length > 0) {
                   log.debug("Task '" + tObj.name + "' wants to run after all other tasks, deferring");
                   deferredTasks.push(tObj);
                   executeTask();
                   return;
                 }
               } else {
                 var intersect = intersection(executedTasks, tObj.depends);
                 if (intersect.length != tObj.depends.length) {
                   log.debug("Deferring task: '" + tObj.name + "'");
                   deferredTasks.push(tObj);
                   executeTask();
                   return;
                 }
               }
             }
             if (tObj) {
               log.debug("Executing task: '" + tObj.name + "'");
               //log.debug("ExecutedTasks: ", executedTasks);
               tObj.task(() => { 
                 executedTasks.push(tObj.name);
                 setTimeout(executeTask, 1); 
               });
             } else {
               log.debug("All tasks executed");
               setTimeout(callback, 1);
             }
           };
           setTimeout(executeTask, 1);
         };

         var loadScripts = () => {

           // keep track of when scripts are loaded so we can execute the callback
           var loaded = 0;
           $.each(plugins, (key, data) => {
             loaded = loaded + data.Scripts.length;
           });

           var totalScripts = loaded;

           var scriptLoaded = () => {
             $.ajaxSetup({async:true});
             loaded = loaded - 1;
             if (lcb) {
               lcb.scriptLoaderCallback(lcb, totalScripts, loaded + 1);
             }
             if (loaded === 0) {
               bootstrap();
             }
           };

           if (loaded > 0) {
             $.each(plugins, (key, data) => {

               data.Scripts.forEach( (script) => {

                 // log.debug("Loading script: ", data.Name + " script: " + script);

                 var scriptName = data.Context + "/" + script;
                 log.debug("Fetching script: ", scriptName);
                 $.ajaxSetup({async:false});
                 $.getScript(scriptName)
                 .done((textStatus) => {
                   log.debug("Loaded script: ", scriptName);
                 })
                 .fail((jqxhr, settings, exception) => {
                   log.info("Failed loading script: \"", exception.message, "\" (<a href=\"", scriptName, ":", exception.lineNumber, "\">", scriptName, ":", exception.lineNumber, "</a>)");
                 })
                 .always(scriptLoaded);
               });
             });
           } else {
             // no scripts to load, so just do the callback
             $.ajaxSetup({async:true});
             bootstrap();
           }
         };

         if (urlsToLoad === 0) {
           loadScripts();
         } else {
           var urlLoaded = () => {
             urlsToLoad = urlsToLoad - 1;
             if (lcb) {
               lcb.urlLoaderCallback(lcb, totalUrls, urlsToLoad + 1);
             }
             if (urlsToLoad === 0) {
               loadScripts();
             }
           };

           $.each(this.urls, (index, url) => {
             log.debug("Trying url: ", url);
             $.get(url, (data) => {
               if (angular.isString(data)) {
                 try {
                   data = angular.fromJson(data);
                 } catch (error) {
                   // ignore this source of plugins
                   return;
                 }
               }
               // log.debug("got data: ", data);
               $.extend(plugins, data);
             }).always(() => {
               urlLoaded();
             });
           });
         }
       }

       public debug() {
         log.debug("urls and modules");
         log.debug(this.urls);
         log.debug(this.modules);
       }

  }

  // bootstrap the app
  $(function () {

    var uaMatch = function( ua ) {
      ua = ua.toLowerCase();

      var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
      /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
      /(msie) ([\w.]+)/.exec( ua ) ||
      ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
      [];

      return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
      };
    };

    // Don't clobber any existing jQuery.browser in case it's different
    if ( !jQuery['browser'] ) {
      var matched = uaMatch( navigator.userAgent );
      var browser = <any> {};

      if ( matched.browser ) {
        browser[ matched.browser ] = true;
        browser.version = matched.version;
      }

      // Chrome is Webkit, but Webkit is also Safari.
      if ( browser.chrome ) {
        browser.webkit = true;
      } else if ( browser.webkit ) {
        browser.safari = true;
      }

      jQuery['browser'] = browser;
    }

    hawtioPluginLoader.loadPlugins(function() {
      if (!HawtioCore.injector) {
        var strictDi = localStorage['hawtioCoreStrictDi'] || false;
        if (strictDi) {
          log.debug("Using strict dependency injection");
        }
        HawtioCore.injector = angular.bootstrap(document, hawtioPluginLoader.getModules(), {
          strictDi: strictDi
        });
        log.debug("Bootstrapped application");
      } else {
        log.debug("Application already bootstrapped");
      }
    });
  });

}

// instantiate the global plugin loader object
var hawtioPluginLoader = new HawtioCore.PluginLoader();


