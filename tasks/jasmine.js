/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

/*jshint node:true, curly:false*/

'use strict';

module.exports = function(grunt) {

  // node api
  var fs   = require('fs'),
      path = require('path');

  // npm lib
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  // local lib
  var jasmine = require('./lib/jasmine');

  var status = {
    specs    : 0,
    failed   : 0,
    passed   : 0,
    total    : 0,
    skipped  : 0,
    duration : 0
  };

  var runners = {
    default   : __dirname + '/jasmine/templates/DefaultRunner.tmpl',
    requirejs : __dirname + '/jasmine/templates/RequireJSRunner.tmpl',
    junit     : __dirname + '/jasmine/templates/JUnit.tmpl'
  };

  var runnerOptions = {
    requirejs : {
      requirejs : jasmine.getRelativeFileList(__dirname + '/../vendor/require-2.1.1.js')[0]
    }
  };

  grunt.registerMultiTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = this.options({
      timeout : 10000,
      specs   : [],
      helpers : [],
      vendor  : [],
      outfile : '_SpecRunner.html',
      host    : '',
      template: 'default',
      templateOptions : {},
      phantomjs : {},
      junit: {}
    });

    grunt.util._.defaults(options.templateOptions, runnerOptions[options.template] || {});
    if (!options.template.match(/\.tmpl$/)) options.template = runners[options.template];

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    setup(options);

    var files = this.file.src;
    jasmine.buildSpecrunner(files,options);

    // If we're just building (e.g. for web), skip phantom.
    if (this.flags.build) return;

    var done = this.async();
    phantomRunner(options, function(err,status) {
      if (err) grunt.log.error(err);
      if (status.failed === 0) grunt.log.ok('0 failures');
      else grunt.log.error(status.failed + ' failures');
      teardown(options);
      done(!err && status.failed === 0);
    });

  });


  function phantomRunner(options,cb){
    var file = options.outfile;

    if (options.host) {
      file = options.host + options.outfile;
    }

    grunt.verbose.subhead('Testing jasmine specs via phantom').or.writeln('Testing jasmine specs via phantom');

    phantomjs.spawn(file, {
      failCode : 90,
      options  : options,
      done     : function(err){
        cb(err,status);
      }
    });

  }

  function teardown(options) {
    if (fs.statSync(options.outfile).isFile()) fs.unlink(options.outfile);

    // Have to explicitly unregister nested wildcards. Need to file a bug for EventEmitter2
    phantomjs.removeAllListeners('*');
    phantomjs.removeAllListeners('jasmine.*');
    phantomjs.removeAllListeners('error.*');
    phantomjs.removeAllListeners('jasmine.done.*');
  }

  function setup(options) {
    var thisRun = {};

    phantomjs.on('fail.timeout',function(){
      grunt.log.writeln();
      grunt.warn('PhantomJS timed out, possibly due to an unfinished async spec.', 90);
    });

    phantomjs.on('console',console.log.bind(console));
    phantomjs.on('verbose',grunt.verbose.writeln.bind(grunt.verbose));
    phantomjs.on('debug', grunt.log.debug.bind(grunt.log, 'phantomjs'));
    phantomjs.on('write', grunt.log.write.bind(grunt.log));
    phantomjs.on('writeln', grunt.log.writeln.bind(grunt.log));
    phantomjs.on('error.onError',function(string, trace){
      if (trace) {
        grunt.log.error(string.red + ' at ');
        trace.forEach(function(line) {
          var file = line.file.replace(/^file:/,'');
          var message = grunt.util._('%s:%d %s').sprintf(path.relative('.',file), line.line, line.function);
          grunt.log.error(message.red);
        });
      } else {
        grunt.log.error(string.red);
      }
    });

    phantomjs.onAny(function() {
      var args = [this.event].concat(grunt.util.toArray(arguments));
      grunt.event.emit.apply(grunt.event, args);
    });

    // Not used?
//    phantomjs.on('jasmine.writeFile',function(type,filename, xml){
//      var dir = options[type] && options[type].output;
//      if (dir) {
//        grunt.file.mkdir(dir);
//        grunt.file.write(path.join(dir, filename), xml);
//      }
//    });


    phantomjs.on('jasmine.reportRunnerStarting',function(suites) {
      grunt.verbose.writeln('Starting...');
      thisRun.start_time = (new Date()).getTime();
      thisRun.executed_specs = 0;
      thisRun.passed_specs = 0;
    });

    phantomjs.on('jasmine.reportSpecStarting',function(spec) {
      thisRun.executed_specs++;
      grunt.verbose.write(spec.suite.description + ':' + spec.description + '...');
    });

    phantomjs.on('jasmine.reportSuiteResults',function(suite){
      //grunt.verbose.writeln(suite.description + ": " + suite.results.passedCount + " of " + suite.results.totalCount + " passed.");
    });

    phantomjs.on('jasmine.reportSpecResults',function(specId, result,summary) {
      if (result.passed) thisRun.passed_specs++;

      grunt.verbose.writeln(summary.passed ? result.msg.green : result.msg.red);
      for (var i = 0; i < result.messages.length; i++) {
        var item = result.messages[i];

        if (item.type === 'log') {
          grunt.verbose.writeln(item.toString());
        } else if (item.type === 'expect' && !item.passed_) {
          grunt.log.writeln(summary.description + ':' + result.msg.red);
          phantomjs.emit('onError', item.message, item.trace);
        }
      }
      phantomjs.emit( 'jasmine.testDone', result.totalCount, result.passedCount, result.failedCount, result.skipped );

    });

    phantomjs.on('jasmine.reportRunnerResults',function(){
      grunt.verbose.writeln('Runner finished');
      var dur = (new Date()).getTime() - thisRun.start_time;
      var failed = thisRun.executed_specs - thisRun.passed_specs;
      var spec_str = thisRun.executed_specs + (thisRun.executed_specs === 1 ? " spec, " : " specs, ");
      var fail_str = failed + (failed === 1 ? " failure in " : " failures in ");
      grunt.log.writeln(spec_str + fail_str + (dur/1000) + "s.");
    });

    phantomjs.on('jasmine.testDone',function(totalAssertions, passedAssertions, failedAssertions, skippedAssertions){
      status.specs++;
      status.failed  += failedAssertions;
      status.passed  += passedAssertions;
      status.total   += totalAssertions;
      status.skipped += skippedAssertions;
    });

    phantomjs.on('jasmine.reportJUnitResults',function(junitData){
      if (options.junit && options.junit.path) {

        if (options.junit.consolidate) {

          grunt.util._(junitData.consolidatedSuites).each(
              function(suites)
              {
                grunt.file.copy(runners.junit, path.join(options.junit.path, 'TEST-' + suites[0].name.replace(/[^\w]/g, '') + '.xml'), {
                  process: function(src) {
                    return grunt.util._.template(
                        src,
                        {
                          testsuites: suites
                        }
                    );
                  }
                });
              }
          );
        } else {
          junitData.suites.forEach(
            function(suiteData)
            {
              grunt.file.copy(runners.junit, path.join(options.junit.path, 'TEST-' + suiteData.name.replace(/[^\w]/g, '') + '.xml'), {
                process: function(src) {
                  return grunt.util._.template(
                    src,
                    {
                      testsuites: [suiteData]
                    }
                  );
                }
              });
            }
          );
        }
      }
    });

    phantomjs.on('jasmine.done',function(elapsed){
      phantomjs.halt();
      status.duration = elapsed;
    });

    phantomjs.on('jasmine.done.PhantomReporter',function(){
      phantomjs.emit('jasmine.done');
    });

    phantomjs.on('jasmine.done_fail',function(url){
      grunt.log.error();
      grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
    });
  }

};