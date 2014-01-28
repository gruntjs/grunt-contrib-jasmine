/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // node api
  var fs = require('fs');
  var path = require('path');
  var chalk = require('chalk');

  // npm lib
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  // local lib
  var jasmine = require('./lib/jasmine').init(grunt, phantomjs);

  var junitTemplate = __dirname + '/jasmine/templates/JUnit.tmpl';

  var status = {};


  var checkmark = '✓';
  var errormark = '✖';

  //With node.js on Windows: use symbols available in terminal default fonts
  //https://github.com/visionmedia/mocha/pull/641
  if (process && process.platform === 'win32') {
    checkmark = '\u221A';
    errormark = '\u00D7';
  }

  grunt.registerMultiTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = this.options({
      version: '1.3.1',
      timeout: 10000,
      styles: [],
      specs: [],
      helpers: [],
      vendor: [],
      outfile: '_SpecRunner.html',
      host: '',
      template: __dirname + '/jasmine/templates/DefaultRunner.tmpl',
      templateOptions: {},
      junit: {}
    });

    if (options.template === 'requirejs') {
      grunt.log.warn(
        'The requirejs template is no longer included in grunt-contrib-jasmine core.\n' +
        'Please see the https://github.com/gruntjs/grunt-contrib-jasmine README for details'
      );
    }

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    setup(options);

    // The filter returned no spec, let's skip phantom.
    if (!jasmine.buildSpecrunner(this.filesSrc, options)) {
      return removePhantomListeners();
    }

    // If we're just building (e.g. for web), skip phantom.
    if (this.flags.build) {
      return;
    }

    var done = this.async();
    phantomRunner(options, function(err, status) {
      var success = !err && status.failed === 0;

      if (err) {
        grunt.log.error(err);
      }
      if (status.failed === 0) {
        grunt.log.ok('0 failures');
      } else {
        grunt.log.error(status.failed + ' failures');
      }

      teardown(options, function() {
        done(success);
      });
    });

  });

  function phantomRunner(options, cb) {
    var file = options.outfile;

    if (options.host) {
      if (!(/\/$/).test(options.host)) {
        options.host += '/';
      }
      file = options.host + options.outfile;
    }

    grunt.verbose.subhead('Testing jasmine specs via PhantomJS').or.writeln('Testing jasmine specs via PhantomJS');
    grunt.log.writeln('');

    phantomjs.spawn(file, {
      failCode: 90,
      options: options,
      done: function(err) {
        cb(err, status);
      }
    });
  }

  function teardown(options, cb) {
    removePhantomListeners();

    if (!options.keepRunner && fs.statSync(options.outfile).isFile()) {
      fs.unlink(options.outfile);
    }
    if (!options.keepRunner) {
      jasmine.cleanTemp(cb);
    } else {
      cb();
    }
  }

  function removePhantomListeners() {
    phantomjs.removeAllListeners();
    phantomjs.listenersAny().length = 0;
  }

  function setup(options) {
    var thisRun = {};

    status = {
      specs: 0,
      failed: 0,
      passed: 0,
      total: 0,
      skipped: 0,
      duration: 0,
      log: ''
    };

    phantomjs.on('fail.timeout', function() {
      grunt.log.writeln();
      grunt.warn('PhantomJS timed out, possibly due to an unfinished async spec.', 90);
    });

    phantomjs.on('console', console.log.bind(console));
    phantomjs.on('verbose', grunt.verbose.writeln.bind(grunt.verbose));
    phantomjs.on('debug', grunt.log.debug.bind(grunt.log, 'phantomjs'));
    phantomjs.on('write', grunt.log.write.bind(grunt.log));
    phantomjs.on('writeln', grunt.log.writeln.bind(grunt.log));
    phantomjs.on('error.onError', function(string, trace) {
      if (trace && trace.length) {
        grunt.log.error(chalk.red(string) + ' at ');
        trace.forEach(function(line) {
          var file = line.file.replace(/^file:/, '');
          var message = grunt.util._('%s:%d %s').sprintf(path.relative('.', file), line.line, line.function);
          grunt.log.error(chalk.red(message));
        });
      } else {
        grunt.log.error('Error caught from PhantomJS. More info can be found by opening the Spec Runner in a browser.');
        grunt.warn(string);
      }
    });

    phantomjs.onAny(function() {
      var args = [this.event].concat(grunt.util.toArray(arguments));
      grunt.event.emit.apply(grunt.event, args);
    });

    phantomjs.on('jasmine.reportRunnerStarting', function(suites) {
      grunt.verbose.writeln('Starting...');
      thisRun.start_time = (new Date()).getTime();
      thisRun.executed_specs = 0;
      thisRun.passed_specs = 0;
    });

    var indent = function(times) {
      return new Array(times + 1).join('  ');
    };

    var currentSuiteList = [];

    phantomjs.on('jasmine.reportSpecStarting', function(description, suiteList) {
      var i;
      var suiteListDifferent = false;

      thisRun.executed_specs++;

      for (i = 0; i < suiteList.length; i++) {
        if (suiteListDifferent || currentSuiteList[i] !== suiteList[i]) {
          suiteListDifferent = true;
          grunt.log.writeln(indent(i + 1) + chalk.bold(suiteList[i]));
        }
      }

      currentSuiteList = suiteList;

      grunt.log.write(indent(currentSuiteList.length + 1) + '- ' + chalk.grey(description));
    });

    phantomjs.on('jasmine.reportSpecResults', function(specId, result, suiteList) {
      var i;

      if (result.passed) {
        thisRun.passed_specs++;
      }

      process.stdout.clearLine();
      process.stdout.cursorTo(0);

      grunt.log.write(indent(currentSuiteList.length + 1));

      if (result.passed) {
        grunt.log.write(chalk.green.bold(checkmark));
      } else {
        grunt.log.write(chalk.red('X'));
      }

      grunt.log.writeln(' ' + chalk.grey(result.description));

      for (i = 0; i < result.messages.length; i++) {
        var item = result.messages[i];

        if (item.type === 'log') {
          grunt.log.writeln(indent(currentSuiteList.length + 3) + item.toString());
        } else if (item.type === 'expect' && !item.passed_) {
          var specIndex = ' (' + (i + 1) + ')';
          grunt.log.writeln(indent(currentSuiteList.length + 3) + chalk.red(item.message + specIndex));
          phantomjs.emit('onError', item.message, item.trace);
        }
      }
      phantomjs.emit('jasmine.testDone', result.totalCount, result.passedCount, result.failedCount, result.skipped);
    });

    phantomjs.on('jasmine.reportRunnerResults', function() {
      var dur = (new Date()).getTime() - thisRun.start_time;
      var spec_str = thisRun.executed_specs + (thisRun.executed_specs === 1 ? ' spec ' : ' specs ');
      grunt.verbose.writeln('Runner finished');
      if (thisRun.executed_specs === 0) {
        grunt.warn('No specs executed, is there a configuration error?');
      }
      if (!grunt.option('verbose')) {
        grunt.log.writeln();
        grunt.log.write(status.log);
      }
      grunt.log.writeln(spec_str + 'in ' + (dur / 1000) + 's.');
    });

    phantomjs.on('jasmine.testDone', function(totalAssertions, passedAssertions, failedAssertions, skippedAssertions) {
      status.specs++;
      status.failed += failedAssertions;
      status.passed += passedAssertions;
      status.total += totalAssertions;
      status.skipped += skippedAssertions;
    });

    phantomjs.on('jasmine.reportJUnitResults', function(junitData) {
      if (options.junit && options.junit.path) {
        var template = grunt.file.read(junitTemplate);
        if (options.junit.consolidate) {
          grunt.util._(junitData.consolidatedSuites).each(function(suites) {
            var xmlFile = path.join(options.junit.path, 'TEST-' + suites[0].name.replace(/[^\w]/g, '') + '.xml');
            grunt.file.write(xmlFile, grunt.util._.template(template, { testsuites: suites }));
          });
        } else {
          junitData.suites.forEach(function(suiteData) {
            var xmlFile = path.join(options.junit.path, 'TEST-' + suiteData.name.replace(/[^\w]/g, '') + '.xml');
            grunt.file.write(xmlFile, grunt.util._.template(template, { testsuites: [suiteData] }));
          });
        }
      }
    });

    phantomjs.on('jasmine.done', function(elapsed) {
      phantomjs.halt();
      status.duration = elapsed;
    });

    phantomjs.on('jasmine.done.PhantomReporter', function() {
      phantomjs.emit('jasmine.done');
    });

    phantomjs.on('jasmine.done_fail', function(url) {
      grunt.log.error();
      grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
    });
  }
};
