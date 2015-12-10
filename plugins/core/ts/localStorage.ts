/// <reference path="corePlugin.ts"/>

module HawtioCore {

  var dummyLocalStorage = {
    length: 0,
    key: function(index) { return undefined; },
    getItem: function (key) { return dummyLocalStorage[key]; },
    setItem: function (key, data) { dummyLocalStorage[key] = data; },
    removeItem: function(key) {
      var removed = dummyLocalStorage[key];
      delete dummyLocalStorage[key];
      return removed;
    },
    clear: function() {

    }
  };

  // localStorage service, returns a dummy impl
  // if for some reason it's not in the window
  // object
  _module.factory('localStorage', function() {
    return window.localStorage || dummyLocalStorage;
  });



}
