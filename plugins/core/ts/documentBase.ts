/// <reference path="corePlugin.ts"/>

module HawtioCore {

  var documentBase = function() {
    var base = $('head').find('base');
    var answer = '/'
    if (base && base.length > 0) {
      answer = base.attr('href');
    } else {
      log.warn("Document is missing a 'base' tag, defaulting to '/'");
    }
    //log.debug("Document base: ", answer);
    return answer;
  }

  /**
   * services, mostly stubs
   */
  // Holds the document base so plugins can easily
  // figure out absolute URLs when needed
  _module.factory('documentBase', function() {
    var docBase = documentBase();
    log.debug("Document base is: ", docBase);
    return docBase;
  });

}


