/// <reference path="logger.d.ts" />
/// <reference path="coreGlobals.d.ts" />
declare module HawtioCore {
    class PluginLoader {
        /**
         * List of URLs that the plugin loader will try and discover
         * plugins from
         * @type {Array}
         */
        private urls;
        /**
         * Holds all of the angular modules that need to be bootstrapped
         * @type {Array}
         */
        private modules;
        private loaderCallback;
        /**
         * Tasks to be run before bootstrapping, tasks can be async.
         * Supply a function that takes the next task to be
         * executed as an argument and be sure to call the passed
         * in function.
         *
         * @type {Array}
         */
        private tasks;
        constructor();
        registerPreBootstrapTask(task: any, front?: boolean): void;
        addModule(module: string): void;
        addUrl(url: any): void;
        getModules(): any[];
        setLoaderCallback(cb: any): void;
        loadPlugins(callback: any): void;
        debug(): void;
    }
}
declare var hawtioPluginLoader: HawtioCore.PluginLoader;
