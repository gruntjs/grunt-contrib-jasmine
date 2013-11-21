/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // node api
  var fs   = require('fs'),
    path = require('path');

  // npm lib
  var phantomjs = require('grunt-lib-phantomjs').init(grunt);

  // local lib
  var jasmine = require('./lib/jasmine').init(grunt, phantomjs);

  var junitTemplate = __dirname + '/jasmine/templates/JUnit.tmpl';

  var status = {};

  grunt.registerMultiTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = this.options({
      version : '2.0.0-rc5',
      timeout : 10000,
      styles  : [],
      specs   : [],
      helpers : [],
      vendor  : [],
      outfile : '_SpecRunner.html',
      host    : '',
      template : __dirname + '/jasmine/templates/DefaultRunner.tmpl',
      templateOptions : {},
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
    if(!jasmine.buildSpecrunner(this.filesSrc, options)) {
      return removePhantomListeners();
    }

    // If we're just building (e.g. for web), skip phantom.
    if (this.flags.build) return;

    var done = this.async();
    phantomRunner(options, function(err,status) {
      var success = !err && status.failed === 0;

      if (err) grunt.log.error(err);
      if (status.failed === 0) grunt.log.ok('0 failures');
      else grunt.log.error(status.failed + ' failures');

      teardown(options, function(){
        done(success);
      });
    });

  });

  function logWrite(text, isInline) {
    text += (isInline ? '' : '\n');
    status.log += text;
    grunt.verbose.write(text);
  }

  function phantomRunner(options,cb){
    var file = options.outfile;

    if (options.host) {
      if (!(/\/$/).test(options.host)) options.host = options.host + '/';
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

  function teardown(options, cb) {
    removePhantomListeners();

    if (!options.keepRunner && fs.statSync(options.outfile).isFile()) fs.unlink(options.outfile);
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
      failed   : 0,
      log      : ''
    };

    phantomjs.on('fail.timeout',function(){
      grunt.log.writeln();
      grunt.warn('PhantomJS timed out, possibly due to an unfinished async spec.', 90);
    });

    phantomjs.on('console',console.log.bind(console));
    phantomjs.on('verbose',function(msg) {
      grunt.verbose.writeln('\nlog: '.yellow + msg);
    });
    phantomjs.on('debug', grunt.log.debug.bind(grunt.log, 'phantomjs'));
    phantomjs.on('write', grunt.log.write.bind(grunt.log));
    phantomjs.on('writeln', grunt.log.writeln.bind(grunt.log));
    phantomjs.on('error.onError',function(string, trace){
      if (trace && trace.length) {
        grunt.log.error(string.red + ' at ');
        trace.forEach(function(line) {
          var file = line.file.replace(/^file:/,'');
          var message = grunt.util._('%s:%d %s').sprintf(path.relative('.',file), line.line, line.function);
          grunt.log.error(message.red);
        });
      } else {
        grunt.log.error("Error caught from phantom. More info can be found by opening the Spec Runner in a browser.");
        grunt.warn(string);
      }
    });

    phantomjs.onAny(function() {
      var args = [this.event].concat(grunt.util.toArray(arguments));
      grunt.event.emit.apply(grunt.event, args);
    });

    phantomjs.on('jasmine.reportRunnerStarting',function() {
      grunt.verbose.writeln('Starting...');
      thisRun.start_time = (new Date()).getTime();
      thisRun.executed_specs = 0;
      thisRun.passed_specs = 0;
    });

    phantomjs.on('jasmine.reportSpecStarting',function(specMetadata) {
      thisRun.executed_specs++;
      grunt.verbose.write(specMetadata.fullName + '...');
    });

    phantomjs.on('jasmine.reportSpecResults',function(specMetadata) {
      if (specMetadata.status === "passed") {
        thisRun.passed_specs++;
        grunt.verbose.writeln(specMetadata.description + ': ' + specMetadata.status.green);
        if (!grunt.option('verbose'))
          grunt.log.write('.'.green);
      } else if (specMetadata.status === "failed") {
        if (grunt.option('verbose'))
          grunt.verbose.writeln(specMetadata.description + ': ' + specMetadata.status.red);
        else {
          logWrite(specMetadata.fullName + ': ' + specMetadata.status.red);
          grunt.log.write('x'.red);
        }
      } else {
        grunt.verbose.writeln(specMetadata.description + ': ' + specMetadata.status.yellow);
        if (!grunt.option('verbose'))
          grunt.log.write('P'.yellow);
      }

      for (var i = 0; i < specMetadata.failedExpectations.length; i++) {
        var item = specMetadata.failedExpectations[i];

        var specIndex = ' ('+(i+1)+')';
        logWrite('  ' + item.message.red+specIndex.red);
        phantomjs.emit('onError', item.message, item.stack);
      }
      phantomjs.emit('jasmine.testDone', specMetadata.failedExpectations.length);
    });

    phantomjs.on('jasmine.reportRunnerResults',function(){
      var dur = (new Date()).getTime() - thisRun.start_time;
      var spec_str = thisRun.executed_specs + (thisRun.executed_specs === 1 ? " spec " : " specs ");
      grunt.verbose.writeln('Runner finished');
      if (thisRun.executed_specs === 0) {
        grunt.warn('No specs executed, is there a configuration error?');
      }
      if (!grunt.option('verbose')) {
        grunt.log.writeln('');
        grunt.log.write(status.log);
      }
      grunt.log.writeln(spec_str + 'in ' + (dur/1000) + "s.");
    });

    phantomjs.on('jasmine.testDone',function(failedAssertions) {
      status.failed += failedAssertions;
    });

    phantomjs.on('jasmine.reportJUnitResults',function(junitData){
      if (options.junit && options.junit.path) {
        var template = grunt.file.read(junitTemplate);
        if (options.junit.consolidate) {
          grunt.util._(junitData.consolidatedSuites).each(function(suites){
            var xmlFile = path.join(options.junit.path, 'TEST-' + suites[0].name.replace(/[^\w]/g, '') + '.xml');
            grunt.file.write(xmlFile, grunt.util._.template(template, { testsuites: suites}));
          });
        } else {
          junitData.suites.forEach(function(suiteData){
            var xmlFile = path.join(options.junit.path, 'TEST-' + suiteData.name.replace(/[^\w]/g, '') + '.xml');
            grunt.file.write(xmlFile, grunt.util._.template(template, { testsuites: [suiteData] }));
          });
        }
      }
    });

    phantomjs.on('jasmine.done',function(elapsed){
      phantomjs.halt();
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
