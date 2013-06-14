
'use strict';

exports.init = function(grunt, phantomjs) {
  // node api
  var fs = require('fs'),
      path = require('path');

  // npm
  var rimraf = require('rimraf');

  var baseDir = '.',
      tempDir = '.grunt/grunt-contrib-jasmine';

  var exports = {};

  exports.writeTempFile = function(dest, contents) {
    var file = path.join(tempDir,dest);
    grunt.file.write(file, contents);
  };

  exports.copyTempFile = function(src, dest) {
    var file = path.join(tempDir,dest);
    grunt.file.copy(src, file);
  };

  exports.cleanTemp = function() {
    rimraf.sync(tempDir);
  };

  exports.buildSpecrunner = function (src, options){

    exports.copyTempFile(__dirname + '/../jasmine/reporters/PhantomReporter.js', 'reporter.js');
    exports.copyTempFile(__dirname + '/../../vendor/jasmine-' + options.version + '/jasmine.css', 'jasmine.css');
    exports.copyTempFile(__dirname + '/../../vendor/jasmine-' + options.version + '/jasmine.js', 'jasmine.js');
    exports.copyTempFile(__dirname + '/../../vendor/jasmine-' + options.version + '/jasmine-html.js', 'jasmine-html.js');
    exports.copyTempFile(__dirname + '/../jasmine/jasmine-helper.js', 'jasmine-helper.js');

    var reporters = [
      tempDir + '/reporter.js'
    ];

    var jasmineCss = [
      tempDir + '/jasmine.css'
    ];

    var source = '',
      outfile = options.outfile,
      specrunner = path.join(baseDir,outfile),
      outdir = path.dirname(outfile);

    jasmineCss = jasmineCss.concat(options.styles);

    var jasmineCore = [
      tempDir + '/jasmine.js',
      tempDir + '/jasmine-html.js'
    ];

    var jasmineHelper = tempDir + '/jasmine-helper.js';

    var context = {
      temp : tempDir,
      css  : exports.getRelativeFileList(outdir, jasmineCss),
      scripts : {
        jasmine   : exports.getRelativeFileList(outdir, jasmineCore),
        helpers   : exports.getRelativeFileList(outdir, options.helpers),
        specs     : exports.getRelativeFileList(outdir, options.specs),
        src       : exports.getRelativeFileList(outdir, src),
        vendor    : exports.getRelativeFileList(outdir, options.vendor),
        reporters : exports.getRelativeFileList(outdir, reporters),
        start     : exports.getRelativeFileList(outdir, jasmineHelper)
      },
      options : options.templateOptions || {}
    };

    if (options.template.process) {
      var task = {
        writeTempFile : exports.writeTempFile,
        copyTempFile : exports.copyTempFile,
        phantomjs : phantomjs
      };
      source = options.template.process(grunt, task, context);
      grunt.file.write(specrunner, source);
    } else {
      grunt.file.copy(options.template, specrunner, {
        process : function(src) {
          source = grunt.util._.template(src, context);
          return source;
        }
      });
    }

    return source;
  };

  exports.getRelativeFileList = function (/* args... */) {

    var list = Array.prototype.slice.call(arguments),
        outdir = list.shift();
    var base = path.resolve(baseDir);
    var files = [];
    list.forEach(function(listItem){
      if (listItem) files = files.concat(grunt.file.expand({nonull: true},listItem));
    });

    files = grunt.util._(files).map(function(file){
      return (/^https?:/).test(file) ? file : path.relative(outdir, file).replace(/\\/g, '/');
    });
    return files;
  };

  return exports;
};

