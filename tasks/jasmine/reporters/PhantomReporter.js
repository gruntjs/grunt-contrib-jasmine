/*global window:false, alert:false, jasmine:false, Node:false, */
/*jshint curly:false*/

'use strict';

var phantom = {};

if (window._phantom) {
  console.log = function(){
    phantom.sendMessage('verbose', Array.prototype.slice.apply(arguments).join(', '));
  };
}

phantom.sendMessage = function() {
  var args = [].slice.call( arguments );
  var payload = JSON.stringify( args );
  if (window._phantom) {
    // alerts are the communication bridge to grunt
    alert( payload );
  }
};

(function(){

  function PhantomReporter() {
    this.started = false;
    this.finished = false;
    this.suites_ = [];
    this.results_ = {};
    this.buffer = '';
  }

  PhantomReporter.prototype.jasmineStarted = function() {
    this.started = true;
    phantom.sendMessage('jasmine.reportRunnerStarting');
  };

  PhantomReporter.prototype.specStarted = function(specMetadata) {
    specMetadata.startTime = (new Date()).getTime();
    phantom.sendMessage('jasmine.reportSpecStarting', specMetadata);
  };

  PhantomReporter.prototype.suiteStarted = function(suiteMetadata) {
    suiteMetadata.startTime = (new Date()).getTime();
  }

  PhantomReporter.prototype.suites = function() {
    return this.suites_;
  };

  PhantomReporter.prototype.summarize_ = function(suiteOrSpec) {
    var isSuite = suiteOrSpec instanceof jasmine.Suite;
    var summary = {
      id: suiteOrSpec.id,
      name: suiteOrSpec.description,
      type: isSuite ? 'suite' : 'spec',
      children: []
    };

    if (isSuite) {
      var children = suiteOrSpec.children();
      for (var i = 0; i < children.length; i++) {
        summary.children.push(this.summarize_(children[i]));
      }
    }
    return summary;
  };

  PhantomReporter.prototype.results = function() {
    return this.results_;
  };

  PhantomReporter.prototype.resultsForSpec = function(specId) {
    return this.results_[specId];
  };

  function map(values, f) {
    var result = [];
    for (var ii = 0; ii < values.length; ii++) {
      result.push(f(values[ii]));
    }
    return result;
  }

  PhantomReporter.prototype.jasmineDone = function() {
    this.finished = true;
    phantom.sendMessage('jasmine.reportRunnerResults');
    //phantom.sendMessage('jasmine.reportJUnitResults', this.generateJUnitSummary(runner));
    phantom.sendMessage('jasmine.done.PhantomReporter');
  };

  PhantomReporter.prototype.suiteDone = function(suiteMetadata) {
    suiteMetadata.duration = (new Date()).getTime() - suiteMetadata.startTime;
  };

  function stringify(obj) {
    if (typeof obj !== 'object') return obj;

    var cache = [], keyMap = [], index;

    var string = JSON.stringify(obj, function(key, value) {
      // Let json stringify falsy values
      if (!value) return value;

      // If we're a node
      if (typeof(Node) !== 'undefined' && value instanceof Node) return '[ Node ]';

      // jasmine-given has expectations on Specs. We intercept to return a
      // String to avoid stringifying the entire Jasmine environment, which
      // results in exponential string growth
      if (value instanceof jasmine.Spec) return '[ Spec: ' + value.description + ' ]';

      // If we're a window (logic stolen from jQuery)
      if (value.window && value.window === value.window.window) return '[ Window ]';

      // Simple function reporting
      if (typeof value === 'function') return '[ Function ]';

      if (typeof value === 'object' && value !== null) {

        if (index = cache.indexOf(value) !== -1) {
          // If we have it in cache, report the circle with the key we first found it in
          return '[ Circular {' + (keyMap[index] || 'root') + '} ]';
        }
        cache.push(value);
        keyMap.push(key);
      }
      return value;
    });
    return string;
  }

  PhantomReporter.prototype.specDone = function(specMetadata) {
    specMetadata.duration = (new Date()).getTime() - specMetadata.startTime;
    this.results_[specMetadata.id] = specMetadata;

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

    phantom.sendMessage( 'jasmine.reportSpecResults', specMetadata);
  };

  PhantomReporter.prototype.getFullName = function(spec) {
    return getNestedSuiteName(spec.suite, ':: ') +  ':: ' + spec.description;
  };

  PhantomReporter.prototype.resultsForSpecs = function(specIds){
    var results = {};
    for (var i = 0; i < specIds.length; i++) {
      var specId = specIds[i];
      results[specId] = this.summarizeResult_(this.results_[specId]);
    }
    return results;
  };

  PhantomReporter.prototype.summarizeResult_ = function(result){
    var summaryMessages = [];
    var messagesLength = result.messages.length;
    for (var messageIndex = 0; messageIndex < messagesLength; messageIndex++) {
      var resultMessage = result.messages[messageIndex];
      summaryMessages.push({
        text: resultMessage.type === 'log' ? resultMessage.toString() : jasmine.undefined,
        passed: resultMessage.passed ? resultMessage.passed() : true,
        type: resultMessage.type,
        message: resultMessage.message,
        trace: {
          stack: resultMessage.passed && !resultMessage.passed() ? resultMessage.trace.stack : jasmine.undefined
        }
      });
    }

    return {
      result : result.result,
      messages : summaryMessages
    };
  };

  function getNestedSuiteName(suite, sep) {
    var names = [];
    while (suite) {
      names.unshift(suite.description);
      suite = suite.parentSuite;
    }
    return names.join(sep ? sep : ' ');
  }

  function getTopLevelSuiteId(suite) {
    var id;
    while (suite) {
      id = suite.id;
      suite = suite.parentSuite;
    }
    return id;
  }

  PhantomReporter.prototype.generateJUnitSummary = function(runner) {
    var consolidatedSuites = {},
        suites = map(runner.suites(), function(suite) {
          var failures = 0;

          var testcases = map(suite.specs(), function(spec) {
            var failureMessages = [];
            var specResults = spec.results();
            var resultsItems = specResults.items_;
            var resultsItemCount = resultsItems.length;

            if (specResults.failedCount) {
              failures++;

              for (var ii = 0; ii < resultsItemCount; ii++) {
                var expectation = resultsItems[ii];
                if (!expectation.passed()) {
                  failureMessages.push(expectation.message);
                }
              }
            }
            return {
              assertions: resultsItemCount,
              className: getNestedSuiteName(spec.suite),
              name: spec.description,
              time: spec.duration / 1000,
              failureMessages: failureMessages
            };
          });

          var data = {
              name: getNestedSuiteName(suite),
              time: suite.duration / 1000,
              timestamp: suite.timestamp,
              tests: suite.specs().length,
              errors: 0, // TODO: These exist in the JUnit XML but not sure how they map to jasmine things
              testcases: testcases,
              failures: failures
            };

          if (suite.parentSuite) {
            consolidatedSuites[getTopLevelSuiteId(suite)].push(data);
          } else {
            consolidatedSuites[suite.id] = [data];
          }
          return data;
        });

    return {
      suites: suites,
      consolidatedSuites: consolidatedSuites
    };
  };

  jasmine.getEnv().addReporter( new PhantomReporter() );
}());
