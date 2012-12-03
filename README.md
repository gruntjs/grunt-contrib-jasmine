# grunt-contrib-jasmine [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-jasmine.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-jasmine)

> Run jasmine specs headlessly through PhantomJS.


## Getting Started
If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide, as it explains how to create a [gruntfile][Getting Started] as well as install and use grunt plugins. Once you're familiar with that process, install this plugin with this command:

```shell
npm install grunt-contrib-jasmine --save-dev
```

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md


## Jasmine task
_Run this task with the `grunt jasmine` command._

### Overview

grunt-contrib-jasmine automatically builds and maintains your spec runner and runs your tests headlessly through
phantomjs

Substantial credit goes to [Camille Reynders](http://creynders.be/) (@creynders) for the first decent implementation
of jasmine through grunt which served as motivation for all the future work.

#### Run specs locally or on an ad hoc server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

#### AMD Support

Includes a SpecRunner template customized for use with AMD modules and requirejs.

#### Customize your SpecRunner with your own template

Supply your own underscore template to automatically build your SpecRunner custom to your use.

#### Example application usage

- [Pivotal Labs' sample application](https://github.com/jsoverson/grunt-contrib-jasmine-example)

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect


### Options

#### src
Type: `String|Array`

*Minimatch* - This defines your source files. These are the files that you are testing.

#### options.specs
Type: `String|Array`

*Minimatch* - These are your Jasmine specs.

#### options.vendor
Type: `String|Array`

*Minimatch* - These are third party libraries, generally loaded before anything else happens in your tests. You'll likely add things
like jQuery and Backbone here.

#### options.helpers
Type: `String|Array`

*Minimatch* - These are non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

#### options.outfile
Type: `String`
Default: `_SpecRunner.html`

This is the auto-generated specfile that phantomjs will use to run your tests. This is automatically deleted upon normal
runs

#### options.host
Type: `String`
Default: ''

This is the host you want phantomjs to connect against to run your tests.

e.g. if using an ad hoc server from within grunt

```js
host : 'http://127.0.0.1:8000/'
```

Or, using templates

```js
host : 'http://127.0.0.1:<%= connect.port %>/'
```

Not defining a host will mean your specs will be run from the local filesystem.

#### options.template
Type: `String`
Default: `default`
Options: `default`, `requirejs`, `yourcustomtemplate.tmpl`

Specify a custom template to use when generating your Spec Runner. Templates are parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

#### options.templateOptions
Type: `Object`
Default: `{}`

These options will be passed to your template as an 'options' hash so that you can provide settings to your template.

### Flags

Name: `build`

Turn on this flag in order to rebuild the specrunner without deleting it. This is useful when troublshooting templates,
running in a browser, or as part of a watch chain e.g.

```js
watch: {
  pivotal : {
    files: ['src/**/*.js', 'specs/**/*.js'],
    tasks: 'jasmine:pivotal:build'
  }
}
```

### Template Options

#### Default template

No specific options are expected or used.

#### RequireJS template

##### templateOptions.requirejs
Type: `String`

The path to requirejs if you need to specify an alternate version.

##### templateOptions.loaderPlugin
Type: `String`

The loader plugin to prefix all loaded `src` files. This is useful for processing
your specs through the likes of CoffeeScript or TypeScript plugins. Keep in mind
you will need to specify the path to the plugin in the require config.

##### templateOptions.requireConfig
Type: `Object`

This object is `JSON.stringify()`-ed into the template and passed into `require.config()`




#### Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js'
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
}
```

#### Supplying a custom template

Supplying a custom template to the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
        template: 'custom.tmpl'
      }
    }
  }
}
```

#### Sample RequireJS usage

```js
// Example configuration
grunt.initConfig({
  connect: {
    test : {
      port : 8000
    }
  }
  jasmine: {
    requirejs: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        host: 'http://127.0.0.1:8000/',
        template: 'requirejs',
        templateOptions: {
          requireConfig: {
            baseUrl: 'src/'
          }
        }
      }
    }
  }
}
```
*Note* the usage of the 'connect' task configuration. You will need to use a task like
[grunt-contrib-connect][] if you need to test your tasks on a running server.

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect

#### RequireJS notes

If you end up using the requirejs template, it's worth looking at the
[RequireJS template source](https://github.com/gruntjs/grunt-contrib-jasmine/blob/master/tasks/jasmine/templates/RequireJSRunner.tmpl)
in order to familiarize yourself with how it loads your files. The load process essentially
consists of a series of nested `require` blocks, incrementally loading your source and specs:

```js
require([*YOUR SOURCE*], function() {
  require([*YOUR SPECS*], function() {
    require([*GRUNT-CONTRIB-JASMINE FILES*], function() {
      // at this point your tests are already running.
    }
  }
}
```


## Release History

 * 2012-12-02   v0.2.0   Generalized requirejs template config, added loader plugin, tests for templates, updated jasmine to 1.3.0
 * 2012-11-23   v0.1.2   Updated for new grunt/grunt-contrib apis
 * 2012-11-06   v0.1.1   Fixed race condition in requirejs template
 * 2012-11-06   v0.1.0   Ported grunt-jasmine-runner and grunt-jasmine-task to grunt-contrib

---

Task submitted by [Jarrod Overson](http://jarrodoverson.com)

*This file was generated on Mon Dec 03 2012 00:32:53.*
