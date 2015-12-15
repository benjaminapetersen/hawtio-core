/// <reference path="../plugins/includes.ts"/>

/// <reference path="../../includes.ts"/>
var HawtioCorePrivate;
(function (HawtioCorePrivate) {
    HawtioCorePrivate.templatePath = "private/core/html";
})(HawtioCorePrivate || (HawtioCorePrivate = {}));

/// <reference path="../../../plugins/core/ts/loader.ts"/>
var LoaderTest;
(function (LoaderTest) {
    var log = Logger.get('test-code');
    log.setLevel(Logger.DEBUG);
    hawtioPluginLoader.registerPreBootstrapTask(function (next) {
        next();
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "AsyncDependantTask",
        depends: ["AsyncTask"],
        task: function (next) {
            console.log("async task ran...");
            next();
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask(function (next) {
        next();
    }, true);
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "AsyncTask",
        depends: ["ParentTask1"],
        task: function (next) {
            console.log("Async task loading");
            setTimeout(function () {
                console.log("Async task executing");
                next();
            }, 50);
            console.log("Async task exiting");
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: 'other-child',
        depends: ['child-task', 'unnamed-task-2'],
        task: function (next) {
            next();
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "Bunk Task 1",
        depends: ['pastry'],
        task: function (next) {
            next();
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "child-task",
        depends: ["ParentTask1"],
        task: function (next) {
            next();
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "Named Task",
        task: function (next) {
            next();
        }
    });
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "ParentTask1",
        task: function (next) {
            next();
        }
    });
    // these won't get executed, they depend on tasks that
    // haven't been registered
    hawtioPluginLoader.registerPreBootstrapTask({
        name: "Bunk Task 2",
        depends: ['foo', 'bar'],
        task: function (next) {
            next();
        }
    });
})(LoaderTest || (LoaderTest = {}));

/// <reference path="common.ts"/>
var HawtioCorePrivate;
(function (HawtioCorePrivate) {
    var pluginName = "private-controller-plugin-1";
    var log = Logger.get(pluginName);
    var _module = angular.module(pluginName, []);
    _module.run(['$router', function ($router) {
            $router.config([
                {
                    path: '/private-controller-plugin-1',
                    component: 'private-controller-1',
                    as: 'PrivateController1'
                }
            ]);
        }]);
    var PrivateController1 = (function () {
        function PrivateController1() {
            log.debug("Private controller 1");
        }
        return PrivateController1;
    })();
    HawtioCorePrivate.PrivateController1 = PrivateController1;
    _module.component('privateController1', {
        restrict: 'EA',
        templateUrl: urljoin(HawtioCorePrivate.templatePath, 'private-controller-1.html'),
        controller: [PrivateController1]
    });
    hawtioPluginLoader.addModule(pluginName);
})(HawtioCorePrivate || (HawtioCorePrivate = {}));

/// <reference path="common.ts"/>
var HawtioCorePrivate;
(function (HawtioCorePrivate) {
    var pluginName = "private-controller-plugin-2";
    var log = Logger.get(pluginName);
    var _module = angular.module(pluginName, []);
    _module.run(['$router', function ($router) {
            $router.config([
                {
                    path: '/private-controller-plugin-2',
                    component: 'private-controller-2',
                    as: 'PrivateController2'
                }
            ]);
        }]);
    var PrivateController2 = (function () {
        function PrivateController2() {
            log.debug("Private controller 2");
        }
        return PrivateController2;
    })();
    HawtioCorePrivate.PrivateController2 = PrivateController2;
    var One = (function () {
        function One() {
            log.debug("one");
        }
        return One;
    })();
    HawtioCorePrivate.One = One;
    var Two = (function () {
        function Two() {
            log.debug("two");
        }
        return Two;
    })();
    HawtioCorePrivate.Two = Two;
    _module.component('privateController2', {
        restrict: 'EA',
        templateUrl: urljoin(HawtioCorePrivate.templatePath, 'private-controller-2.html'),
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
        templateUrl: urljoin(HawtioCorePrivate.templatePath, 'one.html'),
        controller: [One]
    });
    _module.component('two', {
        restrict: 'EA',
        templateUrl: urljoin(HawtioCorePrivate.templatePath, 'two.html'),
        controller: [Two]
    });
    hawtioPluginLoader.addModule(pluginName);
})(HawtioCorePrivate || (HawtioCorePrivate = {}));

angular.module("hawtio-core-private-templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("test-plugins/core/html/one.html","<p>one</p>\n");
$templateCache.put("test-plugins/core/html/private-controller-1.html","<p>Controller 1</p>\n");
$templateCache.put("test-plugins/core/html/private-controller-2.html","<p>Controller 2</p>\n<div ng-outlet></div>\n");
$templateCache.put("test-plugins/core/html/two.html","<p>two</p>\n");}]); hawtioPluginLoader.addModule("hawtio-core-private-templates");