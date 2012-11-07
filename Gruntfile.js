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
    connect : {
      port : 8000,
      base : '.'
    },
    jasmine : {
      options : {
        specs   : 'test/fixtures/pivotal/spec/*Spec.js',
        helpers : 'test/fixtures/pivotal/spec/*Helper.js'
      },
      pivotal : {
        src     : 'test/fixtures/pivotal/src/**/*.js'
      },
      customTemplate : {
        src : 'test/fixtures/pivotal/src/**/*.js',
        options : {
          template : 'test/fixtures/customTemplate/custom.tmpl'
        }
      },
      requirejs : {
        src      : 'test/fixtures/requirejs/src/**/*.js',
        options : {
          specs    : 'test/fixtures/requirejs/spec/*Spec.js',
          helpers  : 'test/fixtures/requirejs/spec/*Helper.js',
          host     : 'http://127.0.0.1:<%= connect.port %>/',
          template : 'requirejs',
          templateOptions  : {
            baseUrl : './test/fixtures/requirejs/src/'
//          requirejs : 'vendor/require-2.1.1.js'
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
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-internal');

  grunt.registerTask('watch-test', ['connect', 'watch']);

  grunt.registerTask('test', ['jasmine:pivotal', 'jasmine:customTemplate', 'connect', 'jasmine:requirejs', 'nodeunit']);
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);
};
