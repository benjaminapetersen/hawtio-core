/// <reference path="../../../plugins/core/ts/loader.ts"/>

module LoaderTest {
  var log = Logger.get('test-code');
  log.setLevel(Logger.DEBUG);
  hawtioPluginLoader.registerPreBootstrapTask((next) => {
    next();
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "AsyncDependantTask",
    depends: ["AsyncTask"],
    task: function(next) {
      console.log("async task ran...");
      next();
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask(function(next) {
    next();
  }, true);
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "AsyncTask",
    depends: ["ParentTask1"],
    task: function(next) {
      console.log("Async task loading");
      setTimeout(function() {
        console.log("Async task executing");
        next();
      }, 50);
      console.log("Async task exiting");
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: 'other-child',
    depends: ['child-task', 'unnamed-task-2'],
    task: function(next) {
      next();
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "Bunk Task 1",
    depends: ['pastry'],
    task: function(next) {
      next();
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "child-task",
    depends: ["ParentTask1"],
    task: function(next) {
      next();
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "Named Task",
    task: function(next) {
      next();
    }
  });
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "ParentTask1",
    task: function(next) {
      next();
    }
  });
  // these won't get executed, they depend on tasks that
  // haven't been registered
  hawtioPluginLoader.registerPreBootstrapTask({
    name: "Bunk Task 2",
    depends: ['foo', 'bar'],
    task: function(next) {
      next();
    }
  });


}
