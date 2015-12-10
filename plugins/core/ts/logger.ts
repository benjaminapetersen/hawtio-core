/// <reference path="../../includes.ts"/>

module HawtioCore {

  // hawtio log initialization
  /* globals Logger window console document localStorage $ angular jQuery navigator Jolokia */

  Logger.setLevel(Logger.INFO);
  var storagePrefix = 'hawtio';

  var oldGet = Logger.get;
  var loggers = {};
  Logger.get = (name) => {
    var answer = oldGet(name);
    loggers[name] = answer;
    return answer;
  };

  // we'll default to 100 statements I guess...
  var logBuffer = 100;

  if ('localStorage' in window) {
    if (!('logLevel' in window.localStorage)) {
      window.localStorage['logLevel'] = JSON.stringify(Logger.INFO);
    }
    var logLevel = Logger.DEBUG;
    try {
      logLevel = JSON.parse(window.localStorage['logLevel']);
    } catch (e) {
      console.error("Failed to parse log level setting: ", e);
    }
    // console.log("Using log level: ", logLevel);
    Logger.setLevel(logLevel);
    if ('showLog' in window.localStorage) {
      var showLog = window.localStorage['showLog'];
      // console.log("showLog: ", showLog);
      if (showLog === 'true') {
        var container = document.getElementById("log-panel");
        if (container) {
          container.setAttribute("style", "bottom: 50%;");
        }
      }
    }
    if ('logBuffer' in window.localStorage) {
      logBuffer = parseInt(window.localStorage['logBuffer'], 10);
    } else {
      window.localStorage['logBuffer'] = logBuffer;
    }
    if ('childLoggers' in window.localStorage) {
      var childLoggers = [];
      try {
        childLoggers = JSON.parse(localStorage['childLoggers']);
      } catch (e) {

      }
      childLoggers.forEach(function(child) {
        Logger.get(child.logger).setLevel(Logger[child.level]);
      });
    }
  }

  var consoleLogger = null;

  if ('console' in window) {
    window['JSConsole'] = window.console;
    consoleLogger = function(messages, context) {
      var MyConsole = window['JSConsole'];
      var hdlr = MyConsole.log;
      // Prepend the logger's name to the log message for easy identification.
      if (context.name) {
        messages[0] = "[" + context.name + "] " + messages[0];
      }
      // Delegate through to custom warn/error loggers if present on the console.
      if (context.level === Logger.WARN && 'warn' in MyConsole) {
        hdlr = MyConsole.warn;
      } else if (context.level === Logger.ERROR && 'error' in MyConsole) {
        hdlr = MyConsole.error;
      } else if (context.level === Logger.INFO && 'info' in MyConsole) {
        hdlr = MyConsole.info;
      }
      if (hdlr && hdlr.apply) {
        try {
          hdlr.apply(MyConsole, messages);
        } catch (e) {
          MyConsole.log(messages);
        }
      }
    };
  }

  // keep these hidden in the Logger object
  var getType = function(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  };

  var isError = function(obj) {
    return obj && getType(obj) === 'Error';
  };

  var isArray = function (obj) {
    return obj && getType(obj) === 'Array';
  };

  var isObject = function (obj) {
    return obj && getType(obj) === 'Object';
  };

  var isString = function(obj) {
    return obj && getType(obj) === 'String';
  };

  window['logInterceptors'] = [];

  Logger.formatStackTraceString = function(stack) {
    var lines = stack.split("\n");
    if (lines.length > 100) {
      // too many lines, let's snip the middle so the browser doesn't bail
      var start = 20;
      var amount = lines.length - start * 2;
      lines.splice(start, amount, '>>> snipped ' + amount + ' frames <<<');
    }
    var stackTrace = "<div class=\"log-stack-trace\">\n";
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j];
      if (line.trim().length === 0) {
        continue;
      }
      //line = line.replace(/\s/g, "&nbsp;");
      stackTrace = stackTrace + "<p>" + line + "</p>\n";
    }
    stackTrace = stackTrace + "</div>\n";
    return stackTrace;
  };


  Logger.setHandler(function(messages, context) {
    // MyConsole.log("context: ", context);
    // MyConsole.log("messages: ", messages);
    var node = undefined;
    var panel = undefined;
    var container = document.getElementById("hawtio-log-panel");
    if (container) {
      panel = document.getElementById("hawtio-log-panel-statements");
      node = document.createElement("li");
    }
    var text = "";
    var postLog = [];
    // try and catch errors logged via console.error(e.toString) and reformat
    if (context['level'].name === 'ERROR' && messages.length === 1) {
      if (isString(messages[0])) {
        var message = messages[0];
        var messageSplit = message.split(/\n/);
        if (messageSplit.length > 1) {
          // we may have more cases that require normalizing, so a more flexible solution
          // may be needed
          var lookFor = "Error: Jolokia-Error: ";
          if (messageSplit[0].search(lookFor) === 0) {
            var msg = messageSplit[0].slice(lookFor.length);
            window['JSConsole'].info("msg: ", msg);
            try {
              var errorObject = JSON.parse(msg);
              var error = <any> new Error();
              error.message = errorObject['error'];
              error.stack = errorObject['stacktrace'].replace("\\t", "&nbsp;&nbsp").replace("\\n", "\n");
              messages = [error];
            } catch (e) {
              // we'll just bail and let it get logged as a string...
            }
          } else {
            var error = <any> new Error();
            error.message = messageSplit[0];
            error.stack = message;
            messages = [error];
          }
        }
      }
    }
    var scroll = false;
    if (node) {
      for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        if (isArray(message) || isObject(message)) {
          var obj = "" ;
          try {
            obj = '<pre data-language="javascript">' + JSON.stringify(message, null, 2) + '</pre>';
          } catch (error) {
            obj = message + " (failed to convert) ";
            // silently ignore, could be a circular object...
          }
          text = text + obj;
        } else if (isError(message)) {
          if ('message' in message) {
            text = text + message['message'];
          }
          if ('stack' in message) {
            postLog.push(function() {
              var stackTrace = Logger.formatStackTraceString(message['stack']);
              var logger = <any> Logger;
              if (context.name) {
                logger = Logger.get(context['name']);
              }
              logger.info("Stack trace: ", stackTrace);
            });
          }
        } else {
          text = text + message;
        }
      }
      if (context.name) {
        text = '[<span class="green">' + context.name + '</span>] ' + text;
      }
      node.innerHTML = text;
      node.className = context.level.name;
      if (container) {
        if (container.scrollHeight === 0) {
          scroll = true;
        }
        if (panel.scrollTop > (panel.scrollHeight - container.scrollHeight - 200)) {
          scroll = true;
        }
      }
    }
    function onAdd() {
      if (panel && node) {
        panel.appendChild(node);
        if (panel.childNodes.length > parseInt(<any> logBuffer)) {
          panel.removeChild(panel.firstChild);
        }
        if (scroll) {
          panel.scrollTop = panel.scrollHeight;
        }
      }
      if (consoleLogger) {
        consoleLogger(messages, context);
      }
      var interceptors = window['logInterceptors'];
      for (var i = 0; i < interceptors.length; i++) {
        interceptors[i](context.level.name, text);
      }
    }
    onAdd();
    postLog.forEach(function (func) { func(); });
  });

  // Catch uncaught exceptions and stuff so we can log them
  /*
     window.onerror = function(msg, url, line, column, errorObject) {
     if (errorObject && Logger.isObject(errorObject)) {
     Logger.get("Window").error(errorObject);
     } else {
     var href = ' (<a href="' + url + ':' + line + '">' + url + ':' + line;

     if (column) {
     href = href + ':' + column;
     }
     href = href + '</a>)';
     Logger.get("Window").error(msg, href);
     }
     return true;
     };
   */

  // sneaky hack to redirect console.log !
  /* window.console = {
     log: Logger.debug,
     warn: Logger.warn,
     error: Logger.error,
     info: Logger.info
     };
   */

}
