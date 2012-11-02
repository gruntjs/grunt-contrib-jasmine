/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 GruntJS Team
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    nodeunit: {
      tasks: ['test/*_test.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  grunt.registerTask('test', ['jasmine', 'nodeunit']);
  grunt.registerTask('default', ['test', 'build-contrib']);
};
