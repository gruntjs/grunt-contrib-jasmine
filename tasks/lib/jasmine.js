'use strict';

exports.init = function(grunt, phantomjs) {
  // node api
  var fs = require('fs'),
      path = require('path');

  // npm
  var rimraf = require('rimraf'),
      _ = require('lodash'),
      jasmineRequire = require('jasmine-core');

  var baseDir = '.';

  var exports = {};

  exports.writeTempFile = function(dest, contents) {
    grunt.file.write(dest, contents);
  };

  exports.copyTempFile = function(src, dest) {
    grunt.file.copy(src, dest);
  };

  exports.cleanTemp = function(tempDir, cb) {
    rimraf(tempDir, function() {
      if(tempDir === '.grunt/grunt-contrib-jasmine') {
        // if this fails, then ./.grunt isn't empty and that's ok.
        fs.rmdir('.grunt', cb);
      } else {
        // don't delete parent directory of a custom directory.
        cb();
      }
    });
  };

  exports.buildSpecrunner = function(src, options) {
    var source = '',
      tempDir = options.tempDir,
      outfile = options.outfile,
      specrunner = path.join(baseDir, outfile),
      outdir = path.dirname(outfile),
      gruntfilter = grunt.option('filter'),
      filteredSpecs = exports.getRelativeFileList(outdir, options.specs);

    // Let's filter through the spec files here,
    // there's no need to go on if no specs matches
    if (gruntfilter) {
      filteredSpecs = specFilter(gruntfilter, filteredSpecs);

      if (filteredSpecs.length === 0) {
        grunt.log.warn('the --filter flag did not match any spec within ' + grunt.task.current.target);
        return null;
      }
    }

    exports.copyTempFile(path.join(__dirname, '/../jasmine/reporters/PhantomReporter.js'), path.join(tempDir, 'reporter.js'));

    [].concat(jasmineRequire.files.cssFiles, jasmineRequire.files.jsFiles).forEach(function(name) {
      var srcPath = path.join(jasmineRequire.files.path, name);
      exports.copyTempFile(srcPath, path.join(tempDir, name));
    });

    jasmineRequire.files.bootFiles.forEach(function(name) {
      var srcPath = path.join(jasmineRequire.files.bootDir, name);
      exports.copyTempFile(srcPath, path.join(tempDir, name));
    });

    exports.copyTempFile(path.join(jasmineRequire.files.imagesDir, 'jasmine_favicon.png'), path.join(tempDir, 'jasmine_favicon.png'));

    var reporters = [
      tempDir + '/reporter.js'
    ];

    var jasmineCss = jasmineRequire.files.cssFiles.map(function(name) {
      return path.join(tempDir, name);
    });

    jasmineCss = jasmineCss.concat(options.styles);

    var polyfills = [].concat(options.polyfills);

    var jasmineCore = jasmineRequire.files.jsFiles.map(function(name) {
      return path.join(tempDir, name);
    });

    var bootFile = tempDir + '/boot.js';

    if (options.customBootFile !== null) {
      bootFile = options.customBootFile;
    }

    var context = {
      temp: tempDir,
      outfile: outfile,
      favicon: path.join(tempDir, 'jasmine_favicon.png'),
      css: exports.getRelativeFileList(outdir, jasmineCss, { nonull: true }),
      scripts: {
        polyfills: exports.getRelativeFileList(outdir, polyfills),
        jasmine: exports.getRelativeFileList(outdir, jasmineCore),
        helpers: exports.getRelativeFileList(outdir, options.helpers, { nonull: true }),
        specs: filteredSpecs,
        src: exports.getRelativeFileList(outdir, src, { nonull: true }),
        vendor: exports.getRelativeFileList(outdir, options.vendor, { nonull: true }),
        reporters: exports.getRelativeFileList(outdir, reporters),
        boot: exports.getRelativeFileList(outdir, bootFile)
      },
      options: options.templateOptions || {}
    };

    if (options.template.process) {
      var task = {
        writeTempFile: exports.writeTempFile,
        copyTempFile: exports.copyTempFile,
        phantomjs: phantomjs
      };
      source = options.template.process(grunt, task, context);
      grunt.file.write(specrunner, source);
    } else {
      grunt.file.copy(options.template, specrunner, {
        process: function(src) {
          source = _.template(src, context);
          return source;
        }
      });
    }

    return source;
  };

  exports.getRelativeFileList = function(outdir, patterns, options) {
    patterns = patterns instanceof Array ? patterns : [ patterns ];
    options = options || {};

    var files = grunt.file.expand(options, _.compact(patterns)).map(function(file) {
      return (/^https?:/).test(file) ? file : path.relative(outdir, file).replace(/\\/g, '/');
    });
    return files;
  };

  // Allows for a spec file to be specified via the command line
  function specFilter(pattern, files) {
    var specPattern,
      patternArray,
      filteredArray = [],
      scriptSpecs = [],
      matchPath = function(path) {
        return !!path.match(specPattern);
      };

    if (pattern) {
      // For '*' to work as a wildcard.
      pattern = pattern.split('*').join('[\\S]*').replace(/\./g, '\\.');
      // This allows for comma separated strings to which we can match the spec files.
      patternArray = pattern.split(',');

      while (patternArray.length > 0) {
        pattern = patternArray.splice(0, 1)[0];

        if (pattern.length > 0) {
          if (pattern.indexOf('/') === -1) {
            specPattern = new RegExp('(' + pattern + '[^/]*)(?!/)$', 'ig');
          } else if (pattern.indexOf('/') === 0) {
            specPattern = new RegExp('(' + pattern + '[^/]*)(?=/)', 'ig');
          } else {
            throw new TypeError('--filter flag seems to be in the wrong format.');
          }

          // push is usually faster than concat.
          [].push.apply(scriptSpecs, files.filter(matchPath));
        }
      }

      filteredArray = _.uniq(scriptSpecs);
    }

    return filteredArray;
  }

  return exports;
};
