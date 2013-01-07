/*global jasmine */
(function()
{
  'use strict';

  function getNestedSuiteName(suite)
  {
    var names = [];
    while (suite) {
      names.unshift(suite.description);
      suite = suite.parentSuite;
    }
    return names.join(' ');
  }

  jasmine.JUnitDataReporter = function()
  {

  };

  jasmine.JUnitDataReporter.prototype = {
    reportRunnerStarting: function(runner) {
    },
    reportRunnerResults: function(runner) {
      var suites = runner.suites().map(
        function(suite)
        {
          var failures = 0,
              data = {
                name: getNestedSuiteName(suite),
                time: suite.duration,
                timestamp: suite.timestamp,
                tests: suite.specs().length,
                errors: 0, // TODO: These exist in the JUnit XML but not sure how they map to jasmine things
                testcases: suite.specs().map(
                  function(spec)
                  {
                    var failureMessages = [];
                    if (spec.results().failedCount) {
                      failures ++;
                      spec.results().items_.forEach(
                        function(expectation)
                        {
                          if (!expectation.passed()) {
                            failureMessages.push((failureMessages.length + 1) + ': ' + expectation.message);
                          }
                        }
                      );
                    }
                    return {
                      className: getNestedSuiteName(spec.suite),
                      name: spec.description,
                      time: spec.duration,
                      failureMessage: failureMessages.join(' ')
                    };
                  }
                )
              };
          data.failures = failures;
          return data;
        }
      );
      console.log('Suites:', suites);
    },
    reportSuiteResults: function(suite) {
      suite.timestamp = new Date();
      suite.duration = suite.timestamp.getTime() - suite.specs()[0].startTime;
    },
    reportSpecStarting: function(spec) {
      spec.startTime = (new Date()).getTime();
    },
    reportSpecResults: function(spec) {
      spec.duration = (new Date()).getTime() - spec.startTime;
    },
    log: function(str) {
      console.log(str);
    }
  };

}());