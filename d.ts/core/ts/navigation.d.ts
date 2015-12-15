/// <reference path="corePlugin.d.ts" />
declare module HawtioCore {
    class NavigationController {
        $router: any;
        $route: any;
        $location: any;
        constructor($router: any, $route: any, $location: any);
    }
}
