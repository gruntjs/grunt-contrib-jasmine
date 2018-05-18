/* global window:true, alert:true, jasmine:true, Node:true */

'use strict';


(function() {
  const sendMessage = (type, param) => {
    window[type] && window[type](param);
  };

  const reporter = {
    jasmineStarted: function() {
      sendMessage('jasmine.jasmineStarted');
    },

    suiteStarted: function(suiteMetadata) {
      suiteMetadata.startTime = (new Date()).getTime();
      sendMessage('jasmine.suiteStarted', suiteMetadata);
    },

    specStarted: function(specMetadata) {
      sendMessage('jasmine.specStarted', specMetadata);
      specMetadata.startTime = (new Date()).getTime();
    },

    specDone: function(specMetadata) {
      specMetadata.duration = (new Date()).getTime() - specMetadata.startTime;

      // Quick hack to alleviate cyclical object breaking JSONification.
      for (var ii = 0; ii < specMetadata.failedExpectations.length; ii++) {
        var item = specMetadata.failedExpectations[ii];
        if (item.expected) {
          item.expected = stringify(item.expected);
        }
        if (item.actual) {
          item.actual = stringify(item.actual);
        }
      }

      sendMessage('jasmine.specDone', specMetadata);
    },

    suiteDone: function(suiteMetadata) {
      suiteMetadata.duration = (new Date()).getTime() - suiteMetadata.startTime;
      sendMessage('jasmine.suiteDone', suiteMetadata);
    },

    jasmineDone: function() {
      sendMessage('jasmine.jasmineDone');
    }
  };

  function stringify(obj) {
    if (typeof obj !== 'object') {
      return obj;
    }

    var cache = [], keyMap = [];

    var string = JSON.stringify(obj, function(key, value) {
      // Let json stringify falsy values
      if (!value) {
        return value;
      }

      try {
        // If we're a node
        if (typeof Node !== 'undefined' && value instanceof Node) {
          return '[ Node ]';
        }

        // jasmine-given has expectations on Specs. We intercept to return a
        // String to avoid stringifying the entire Jasmine environment, which
        // results in exponential string growth
        if (value instanceof jasmine.Spec) {
          return '[ Spec: ' + value.description + ' ]';
        }

        // If we're a window (logic stolen from jQuery)
        if (value.window && value.window === value.window.window) {
          return '[ Window ]';
        }

        // Simple function reporting
        if (typeof value === 'function') {
          return '[ Function ]';
        }

        if (typeof value === 'object' && value !== null) {

          var index = cache.indexOf(value);

          if (index !== -1) {
            // If we have it in cache, report the circle with the key we first found it in
            return '[ Circular {' + (keyMap[index] || 'root') + '} ]';
          }
          cache.push(value);
          keyMap.push(key);
        }
      } catch (e) {
        return '[Object]';
      }
      return value;
    });
    return string;
  }

  jasmine.getEnv().addReporter(reporter);
}());
