/*jshint latedef:false, curly:false*/

'use strict';

var grunt = require('grunt'),
    path = require('path');

var baseDir = '.';

exports.buildSpecrunner     = buildSpecrunner;
exports.getRelativeFileList = getRelativeFileList;

function buildSpecrunner(src, options){
  var reporters = [
    __dirname + '/../jasmine/reporters/PhantomReporter.js'
  ];

  var jasmineCss = [
    __dirname + '/../../vendor/jasmine-1.3.0/jasmine.css'
  ];

  var jasmineCore = [
    __dirname + '/../../vendor/jasmine-1.3.0/jasmine.js',
    __dirname + '/../../vendor/jasmine-1.3.0/jasmine-html.js'
  ];

  var jasmineHelper = __dirname + '/../jasmine/jasmine-helper.js';

  var context = {
    css  : getRelativeFileList(jasmineCss),
    scripts : {
      jasmine   : getRelativeFileList(jasmineCore),
      helpers   : getRelativeFileList(options.helpers),
      specs     : getRelativeFileList(options.specs),
      src       : getRelativeFileList(src),
      vendor    : getRelativeFileList(options.vendor),
      reporters : getRelativeFileList(reporters),
      start     : getRelativeFileList(jasmineHelper)
    },
    options : options.templateOptions || {}
  };

  var source = '';
  grunt.file.copy(options.template, path.join(baseDir,options.outfile), {
    process : function(src) {
      source = grunt.util._.template(src, context);
      return source;
    }
  });
  return source;
}


function getRelativeFileList(/* args... */) {

  var list = Array.prototype.slice.call(arguments);
  var base = path.resolve(baseDir);
  var files = [];
  list.forEach(function(listItem){
    if (listItem) files = files.concat(grunt.file.expandFiles(listItem));
  });
  files = grunt.util._(files).map(function(file){
    return path.resolve(file).replace(base,'.').replace(/\\/g,'/');
  });
  return files;
}

