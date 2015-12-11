/// <reference path="../../includes.ts"/>

module HawtioCore {
  export var injector:ng.auto.IInjectorService = <ng.auto.IInjectorService> null;
  export var templatePath = 'plugins/core/html';
  export var pluginName = 'hawtio-core';
  export var log = Logger.get(pluginName);
}
