/*global window:false, alert:false, jasmine:false, Node:false, */
/*jshint curly:false*/

(function(){
  'use strict';

  var phantom = {};

  phantom.sendMessage = function(){
    var args = [].slice.call( arguments );
    var payload = JSON.stringify( args );
    if (window._phantom) {
      alert( payload );
    } else {
      console.log(payload);
    }
  };

  function PhantomReporter() {
    this.started = false;
    this.finished = false;
    this.suites_ = [];
    this.results_ = {};
    this.buffer = '';
  }

  PhantomReporter.prototype.log = function(str) {
    phantom.sendMessage('verbose',str);
  };

  PhantomReporter.prototype.reportRunnerStarting = function(runner) {
    this.started = true;

    var suites = runner.topLevelSuites();
    for (var i = 0; i < suites.length; i++) {
      var suite = suites[i];
      this.suites_.push(this.summarize_(suite));
    }
    phantom.sendMessage('jasmine.reportRunnerStarting', this.suites_);
  };

  PhantomReporter.prototype.reportSpecStarting = function(spec) {
    var message = {
      suite : {
        description : spec.suite.description
      },
      description : spec.description
    };
    phantom.sendMessage('jasmine.reportSpecStarting', message);
  };

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

  PhantomReporter.prototype.reportRunnerResults = function(runner) {
    this.finished = true;
    var specIds = runner.specs().map(function(a){return a.id;});
    var summary = this.resultsForSpecs(specIds);
    phantom.sendMessage('jasmine.reportRunnerResults',summary);
    phantom.sendMessage('jasmine.done.PhantomReporter');
  };

  PhantomReporter.prototype.reportSuiteResults = function(suite) {
    phantom.sendMessage('jasmine.reportSuiteResults',{
      description : suite.description,
      results : suite.results()
    });
  };

  function stringify(obj) {
    if (typeof obj !== 'object') return obj;

    var cache = [], keyMap = [], tempArray, index;

    var string = JSON.stringify(obj, function(key, value) {
      // Let json stringify falsy values
      if (!value) return value;

      // If we're a node
      if (value instanceof Node) return '[ Node ]';

      // If we're a window (logic stolen from jQuery)
      if (value.window && value.window === value.window.window) return '[ Window ]';

      // Simple function reporting
      if (typeof value === 'function') return '[ Function ]';

      if (typeof value === 'object' && value !== null) {

        // Check to see if we have a pseudo array that can be converted
        if (value.length && (tempArray = Array.prototype.slice.call(value)).length === value.length) value = tempArray;

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

  PhantomReporter.prototype.reportSpecResults = function(spec) {
    var _results = spec.results();
    var results = {
      description : _results.description,
      messages    : _results.getItems(),
      failedCount : _results.failedCount,
      totalCount  : _results.totalCount,
      passedCount : _results.passedCount,
      skipped     : _results.skipped,
      passed      : _results.passed(),
      msg         : _results.failedCount > 0 ? "failed" : "passed"
    };

    this.results_[spec.id] = results;

    // Quick hack to alleviate cyclical object breaking JSONification.
    results.messages.forEach(function(item){
      if (item.expected) {
        item.expected = stringify(item.expected);
      }
      if (item.actual) {
        item.actual = stringify(item.actual);
      }
    });

    phantom.sendMessage( 'jasmine.reportSpecResults', spec.id, results, this.resultsForSpec(spec.id));

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

  jasmine.getEnv().addReporter( new PhantomReporter() );
}());
