/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 GruntJS Team
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // node api
  const fs = require('fs'),
      path = require('path'),
      events = require('events');

  // npm lib
  const puppeteer = require('puppeteer'),
      chalk = require('chalk'),
      _ = require('lodash');

  // local lib
  const jasmine = require('./lib/jasmine').init(grunt);

  const junitTemplate = path.join(__dirname, '/jasmine/templates/JUnit.tmpl');

  var status = {};

  var symbols = {
    none: {
      check: '',
      error: '',
      splat: ''
    },
    short: {
      check: '.',
      error: 'X',
      splat: '*'
    },
    full: {
      check: '✓',
      error: 'X',
      splat: '*'
    }
  };

  // With node.js on Windows: use symbols available in terminal default fonts
  // https://github.com/visionmedia/mocha/pull/641
  if (process && process.platform === 'win32') {
    symbols = {
      none: {
        check: '',
        error: '',
        splat: ''
      },
      short: {
        check: '.',
        error: '\u00D7',
        splat: '*'
      },
      full: {
        check: '\u221A',
        error: '\u00D7',
        splat: '*'
      }
    };
  }

  grunt.registerMultiTask('jasmine', 'Run Jasmine specs headlessly.', async function() {
    // Merge task-specific options with these defaults.
    var options = this.options({
      version: 'latest',
      timeout: 30000,
      styles: [],
      specs: [],
      helpers: [],
      vendor: [],
      polyfills: [],
      customBootFile: null,
      tempDir: '.grunt/grunt-contrib-jasmine',
      outfile: '_SpecRunner.html',
      host: '',
      template: path.join(__dirname, '/jasmine/templates/DefaultRunner.tmpl'),
      templateOptions: {},
      junit: {},
      ignoreEmpty: grunt.option('force') === true,
      display: 'full',
      sandboxArgs: { args: [] },
      summary: false
    });

    // Setup a fresh event dispatcher to catch page events
    var dispatcher = new events.EventEmitter();

    if (grunt.option('debug')) {
      grunt.log.debug(options);
    }

    var done = this.async();

    // The filter returned no spec files so skip headless.
    if (!(await jasmine.buildSpecrunner(this.filesSrc, options, dispatcher))) {
      done(false);
      return;
    }

    // If we're just building (e.g. for web), skip headless.
    if (this.flags.build) {
      done(true);
      return;
    }

    const err = await launchPuppeteer(options, dispatcher);
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

  async function launchPuppeteer(options, dispatcher) {
    var file = options.outfile;

    if (options.host) {
      if (!(/\/$/).test(options.host)) {
        options.host += '/';
      }
      file = options.host + options.outfile;
    } else {
      file = `file://${path.join(process.cwd(), file)}`;
    }

    let puppeteerLaunchSetting = options.sandboxArgs || {};

    // Drop these at major, to remove the option.
    if(options.hasOwnProperty('noSandbox') && options.noSandbox){
        puppeteerLaunchSetting = {args: ['--no-sandbox']};
        delete options.noSandbox;
    }

    if (options.hasOwnProperty('allowFileAccess') && options.allowFileAccess) {
      if (puppeteerLaunchSetting && puppeteerLaunchSetting.args.length > 0) {
        puppeteerLaunchSetting.args.push('--allow-file-access-from-files');
      } else {
        puppeteerLaunchSetting = { args: ['--allow-file-access-from-files'] };
      }
      delete options.allowFileAccess;
    }

    const browser = await puppeteer.launch(puppeteerLaunchSetting);
    grunt.log.subhead(`Testing specs with Jasmine/${options.version} via ${await browser.version()}`);
    const page = await browser.newPage();


    let resolveJasmine;
    const jasminePromise = new Promise((resolve) => {
      resolveJasmine = resolve;
    });

    try {
      await setup(options, dispatcher, page, resolveJasmine);
      page.setDefaultTimeout(options.timeout);
      await page.goto(file, { waitUntil: 'domcontentloaded' });

      await jasminePromise;
    } catch (error) {
      grunt.log.error('Error caught from Puppeteer');
      grunt.warn(error.stack);
    }

    await page.close();
    await browser.close();

    return;
  }

  function teardown(options, cb) {
    if (!options.keepRunner && fs.statSync(options.outfile).isFile()) {
      fs.unlinkSync(options.outfile);
    }

    if (!options.keepRunner) {
      jasmine.cleanTemp(options.tempDir, cb);
    } else {
      cb();
    }
  }

  async function setup(options, dispatcher, page, resolveJasmine) {
    var indentLevel = 1,
      tabstop = 2,
      thisRun = {},
      suites = {},
      currentSuite;

    status = {
      failed: 0
    };

    function indent(times) {
      return new Array(+times * tabstop).join(' ');
    }

    page.on('error', (error) => {
      // page has crashed
      grunt.log.error('Error caught from Headless Chrome. More info can be found by opening the Spec Runner in a browser.');
      grunt.log.warn(error.stack);
    });

    page.on('console', (msg) => {
      thisRun.cleanConsole = false;
      if (options.display === 'full') {
        grunt.log.writeln('\n' + chalk.yellow('log: ' + msg.text()));
      }
    });

    await page.exposeFunction('sendMessage', function () {
      dispatcher.emit.apply(dispatcher, arguments);
    });

    dispatcher.on('jasmine.jasmineStarted', function() {
      grunt.verbose.writeln('Jasmine Runner Starting...');
      thisRun.startTime = (new Date()).getTime();
      thisRun.executedSpecs = 0;
      thisRun.passedSpecs = 0;
      thisRun.failedSpecs = 0;
      thisRun.skippedSpecs = 0;
      thisRun.summary = [];
    });

    dispatcher.on('jasmine.suiteStarted', function suiteStarted(suiteMetadata) {
      grunt.verbose.writeln('jasmine.suiteStarted');
      currentSuite = suiteMetadata.id;
      suites[currentSuite] = {
        name: suiteMetadata.fullName,
        timestamp: new Date(suiteMetadata.startTime),
        errors: 0,
        tests: 0,
        failures: 0,
        testcases: []
      };
      if (options.display === 'full') {
        grunt.log.write(indent(indentLevel++));
        grunt.log.writeln(chalk.bold(suiteMetadata.description));
      }
    });

    dispatcher.on('jasmine.specStarted', function(specMetaData) {
      grunt.verbose.writeln('jasmine.specStarted');
      thisRun.executedSpecs++;
      thisRun.cleanConsole = true;
      if (options.display === 'full') {
        grunt.log.write(indent(indentLevel) + '- ' + chalk.grey(specMetaData.description) + '...');
      } else if (options.display === 'short') {
        grunt.log.write(chalk.grey('.'));
      }
    });

    dispatcher.on('jasmine.specDone', function(specMetaData) {
      grunt.verbose.writeln('jasmine.specDone');
      var specSummary = {
        assertions: 0,
        classname: suites[currentSuite].name,
        name: specMetaData.description,
        time: specMetaData.duration / 1000,
        failureMessages: []
      };

      suites[currentSuite].tests++;

      var color = 'yellow',
          symbol = 'splat';
      if (specMetaData.status === 'passed') {
        thisRun.passedSpecs++;
        color = 'green';
        symbol = 'check';
      } else if (specMetaData.status === 'failed') {
        thisRun.failedSpecs++;
        status.failed++;
        color = 'red';
        symbol = 'error';
        suites[currentSuite].failures++;
        suites[currentSuite].errors += specMetaData.failedExpectations.length;
        specSummary.failureMessages = specMetaData.failedExpectations.map(function(error) {
          return error.message;
        });
        thisRun.summary.push({
          suite: suites[currentSuite].name,
          name: specMetaData.description,
          errors: specMetaData.failedExpectations.map(function(error) {
            return {
              message: error.message,
              stack: error.stack
            };
          })
        });
      } else {
        thisRun.skippedSpecs++;
      }

      suites[currentSuite].testcases.push(specSummary);

      // If we're writing to a proper terminal, make it fancy.
      if (process.stdout.clearLine) {
        if (options.display === 'full') {
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          grunt.log.writeln(
            indent(indentLevel) +
              chalk[color].bold(symbols.full[symbol]) + ' ' +
              chalk.grey(specMetaData.description)
          );
        } else if (options.display === 'short') {
          process.stdout.moveCursor(-1);
          grunt.log.write(chalk[color].bold(symbols.short[symbol]));
        }
      } else {
        // If we haven't written out since we've started
        if (thisRun.cleanConsole) {
          // then append to the current line.
          if (options.display !== 'none') {
            grunt.log.writeln('...' + symbols[options.display][symbol]);
          }
        } else {
          // Otherwise reprint the current spec and status.
          if (options.display !== 'none') {
            grunt.log.writeln(
              indent(indentLevel) + '...' +
              chalk.grey(specMetaData.description) + '...' +
              symbols[options.display][symbol]
            );
          }
        }
      }

      specMetaData.failedExpectations.forEach(function(error, i) {
        var specIndex = ' (' + (i + 1) + ')';
        if (options.display === 'full') {
          grunt.log.writeln(indent(indentLevel + 1) + chalk.red(error.message + specIndex));
        }
        grunt.log.error(error.message, error.stack);
      });

    });

    dispatcher.on('jasmine.suiteDone', function suiteDone(suiteMetadata) {
      grunt.verbose.writeln('jasmine.suiteDone');
      suites[suiteMetadata.id].time = suiteMetadata.duration / 1000;

      if (indentLevel > 1) {
        indentLevel--;
      }
    });

    dispatcher.on('jasmine.jasmineDone', function() {
      grunt.verbose.writeln('jasmine.jasmineDone');
      var dur = (new Date()).getTime() - thisRun.startTime;
      var specQuantity = thisRun.executedSpecs + (thisRun.executedSpecs === 1 ? ' spec ' : ' specs ');

      grunt.verbose.writeln('Jasmine runner finished');

      if (thisRun.executedSpecs === 0) {
        // log.error will print the message but not fail the task, warn will do both.
        var log = options.ignoreEmpty ? grunt.log.error : grunt.warn;

        log('No specs executed, is there a configuration error?');
      }

      if (options.display === 'short') {
        grunt.log.writeln();
      }

      if (options.summary && thisRun.summary.length) {
        grunt.log.writeln();
        logSummary(thisRun.summary);
      }

      if (options.junit && options.junit.path) {
        writeJunitXml(suites);
      }

      grunt.log.writeln('\n' + specQuantity + 'in ' + (dur / 1000) + 's.');

      resolveJasmine();
    });

    dispatcher.on('jasmine.done_fail', function(url) {
      grunt.log.error();
      grunt.warn('Unable to load "' + url + '" URI.', 90);

      resolveJasmine();
    });

    function logSummary(tests) {
      grunt.log.writeln('Summary (' + tests.length + ' tests failed)');
      _.forEach(tests, function(test) {
        grunt.log.writeln(chalk.red(symbols[options.display].error) + ' ' + test.suite + ' ' + test.name);
        _.forEach(test.errors, function(error) {
          grunt.log.writeln(indent(2) + chalk.red(error.message));
          logStack(error.stack, 2);
        });
      });
    }

    function logStack(stack, indentLevel) {
      var lines = (stack || '').split('\n');
      for (var i = 0; i < lines.length && i < 11; i++) {
        grunt.log.writeln(indent(indentLevel) + lines[i]);
      }
    }

    function writeJunitXml(testsuites) {
      var template = grunt.file.read(options.junit.template || junitTemplate);
      if (options.junit.consolidate) {
        var xmlFile = path.join(options.junit.path, 'TEST-' + testsuites.suite1.name.replace(/[^\w]/g, '') + '.xml');
        grunt.file.write(xmlFile, _.template(template)({ testsuites: _.values(testsuites) }));
      } else {
        _.forEach(testsuites, function(suiteData) {
          var xmlFile = path.join(options.junit.path, 'TEST-' + suiteData.name.replace(/[^\w]/g, '') + '.xml');
          grunt.file.write(xmlFile, _.template(template)({ testsuites: [suiteData] }));
        });
      }
    }
  }
};
