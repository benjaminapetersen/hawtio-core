/// <reference path="corePlugin.d.ts" />
declare module HawtioCore {
    class BreadcrumbsController {
        $router: any;
        $location: any;
        paths: any[];
        constructor($router: any, $location: any);
    }
}
