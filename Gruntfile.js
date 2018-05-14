/*
 * grunt-contrib-jasmine
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 GruntJS Team
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      return500: {
        options: {
          port: 10921,
          middleware: function() {
            return [function(req, res) {
              res.statusCode = 500;
              res.end();
            }];
          }
        }
      }
    },
    eslint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        'test/*.js',
        'test/selfTest/*.js'
      ],
      options: {
        configFile: '.eslintrc'
      }
    },
    watch: {
      dev: {
        files: ['tasks/**/*'],
        tasks: ['jasmine:pivotal:build']
      }
    },
    jasmine: {
      pivotal: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          specs: 'test/fixtures/pivotal/spec/*Spec.js',
          helpers: 'test/fixtures/pivotal/spec/*Helper.js',
          summary: true,
          junit: {
            path: 'junit'
          },
          display: 'full'
        }
      },
      consoleDisplayOptions: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          specs: 'test/fixtures/pivotal/spec/*Spec.js',
          helpers: 'test/fixtures/pivotal/spec/*Helper.js',
          display: 'short',
          summary: true
        }
      },
      consoleDisplayOptionsNone: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          specs: 'test/fixtures/pivotal/spec/*Spec.js',
          helpers: 'test/fixtures/pivotal/spec/*Helper.js',
          display: 'none',
          summary: true
        }
      },
      deepOutfile: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          specs: 'test/fixtures/pivotal/spec/*Spec.js',
          helpers: 'test/fixtures/pivotal/spec/*Helper.js',
          outfile: 'tmp/spec.html'
        }
      },
      externalVendor: {
        src: 'test/fixtures/externalVendor/src/**/*.js',
        options: {
          specs: 'test/fixtures/externalVendor/spec/**/*.js',
          vendor: 'http://code.jquery.com/jquery-1.10.1.min.js'
        }
      },
// @todo: automate fail case here
//      syntaxError: {
//        src: 'test/fixtures/syntaxError/src/**/*.js',
//        options: {
//          specs: 'test/fixtures/syntaxError/spec/**/*.js'
//        }
//      },
      customTemplate: {
        src: 'test/fixtures/pivotal/src/**/*.js',
        options: {
          specs: 'test/fixtures/pivotal/spec/*Spec.js',
          helpers: 'test/fixtures/pivotal/spec/*Helper.js',
          template: 'test/fixtures/customTemplate/custom.tmpl',
          junit: {
            path: 'junit/customTemplate',
            consolidate: true
          }
        }
      },
      customTempDir: {
        src: 'test/fixtures/custom-temp-dir/src/**/*.js',
        options: {
          specs: 'test/fixtures/custom-temp-dir/spec/**/*.js',
          tempDir: '.custom/'
        }
      },
      selfTest: {
        options: {
          specs: ['test/selfTest/*.js'],
          '--web-security': 'no'
        }
      }
    },
    nodeunit: {
      tasks: ['test/*_test.js']
    }
  });

  grunt.loadTasks('tasks');

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('test', ['eslint', 'connect:return500', 'jasmine', 'nodeunit']);
  grunt.registerTask('temp', ['jasmine:selfTest', 'jasmine:customTempDir', 'jasmine:selfTest:build']);
  grunt.registerTask('default', ['test', 'build-contrib']);
};
