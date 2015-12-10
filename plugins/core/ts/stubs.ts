/// <reference path="corePlugin.ts"/>

module HawtioCore {

  // Holds a mapping of plugins to layouts, plugins use 
  // this to specify a full width view, tree view or their 
  // own custom view
  _module.factory('viewRegistry', function() {
    return {};
  });

  // Placeholder service for the help registry
  _module.factory('helpRegistry', function() {
    return {
      addUserDoc: function() {},
      addDevDoc: function() {},
      addSubTopic: function() {},
      getOrCreateTopic: function() { return undefined; },
      mapTopicName: function() { return undefined; },
      mapSubTopicName: function() { return undefined; },
      getTopics: function() { return undefined; },
      disableAutodiscover: function() {},
      discoverHelpFiles: function() {}
    };
  });

  // Placeholder service for the preferences registry
  _module.factory('preferencesRegistry', function() {
    return {
      addTab: function() {},
      getTab: function() { return undefined; },
      getTabs: function() { return undefined; }
    };
  });

  // Placeholder service for the page title service
  _module.factory('pageTitle', function() {
    return {
      addTitleElement: function() {},
      getTitle: function() { return undefined; },
      getTitleWithSeparator: function() { return undefined; },
      getTitleExcluding: function() { return undefined; },
      getTitleArrayExcluding: function() { return undefined; }
    };
  });

  // service for the javascript object that does notifications
  _module.factory('toastr', ["$window", function ($window) {
    var answer = $window.toastr;
    if (!answer) {
      // lets avoid any NPEs
      answer = {};
      $window.toastr = answer;
    }
    return answer;
  }]);

  _module.factory('HawtioDashboard', function() {
    return {
      hasDashboard: false,
      inDashboard: false,
      getAddLink: function() {
        return '';
      }
    }; 
  });

  // Placeholder service for branding
  _module.factory('branding', function() {
    return {};
  });

  // Placeholder user details service
  _module.factory('userDetails', function() {
    return {
      logout: function() {
        log.debug("Dummy userDetails.logout()");
      }
    };
  });


}
