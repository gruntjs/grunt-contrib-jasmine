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

    connect: {
      return500: {
        options: {
          port: 9000,
            middleware: function(connect, options) {
              return [function(req, res, next){
                res.statusCode = 500;
                res.end();
              }];
            }
          }
        }
    },
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
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
      legacyVersion: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          version: '1.2.0'
        }
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
      },
      selfTest: {
        options: {
          specs:["test/selfTest/*.js"],
          "--web-security": "no"
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
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['connect:return500', 'jasmine', 'nodeunit']);
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);
};
