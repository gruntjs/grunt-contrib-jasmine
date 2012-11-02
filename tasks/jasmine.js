/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var path = require('path');

  grunt.registerTask('jasmine', 'Run jasmine specs headlessly through PhantomJS.', function() {

    // Merge task-specific options with these defaults.
    var options = grunt.util._.defaults(grunt.config('jasmine'), {
    });

    if (grunt.option('debug')) {
    }

    // Start server.
    grunt.log.writeln('');

  });

};
