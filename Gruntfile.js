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
        'tasks/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    watch: {
      files: ['test/fixtures/pivotal/**/*.js'],
      tasks: 'jasmine:pivotal:build'
    },
    connect: {
      test: {
        port: 8000,
        base: '.'
      }
    },
    jasmine: {
      options: {
        specs: 'test/fixtures/pivotal/spec/*Spec.js',
        helpers: 'test/fixtures/pivotal/spec/*Helper.js',
        junit: {
          path: 'junit'
        }
      },
      pivotal: {
        src: 'test/fixtures/pivotal/src/**/*.js'
      },
      customTemplate: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          template: 'test/fixtures/customTemplate/custom.tmpl',
          junit: {
            path: 'junit/customTemplate',
            consolidate: true
          }
        }
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

  grunt.registerTask('watch-test', ['connect', 'watch']);

  grunt.registerTask('test', ['jshint', 'jasmine:pivotal', 'jasmine:customTemplate', 'nodeunit']);
  grunt.registerTask('default', ['test', 'build-contrib']);
};
