# grunt-contrib-jasmine [![Build Status](https://secure.travis-ci.org/gruntjs/grunt-contrib-jasmine.png?branch=master)](http://travis-ci.org/gruntjs/grunt-contrib-jasmine)

> Run jasmine specs headlessly through PhantomJS.

_Note that this plugin has not yet been released, and only works with the latest bleeding-edge, in-development version of grunt. See the [When will I be able to use in-development feature 'X'?](https://github.com/gruntjs/grunt/blob/devel/docs/faq.md#when-will-i-be-able-to-use-in-development-feature-x) FAQ entry for more information._

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-contrib-jasmine --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-contrib-jasmine');
```

If the plugin has been installed correctly, running `grunt --help` at the command line should list the newly-installed plugin's task or tasks. In addition, the plugin should be listed in package.json as a `devDependency`, which ensures that it will be installed whenever the `npm install` command is run.

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html


## The jasmine task

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

**'requirejs'** default templateOptions :

```js
  requirejs : __dirname + '/../vendor/require-#.#.#.js',
  baseUrl   : ''
```

- requirejs : the location of the included requirejs.
- baseUrl : set in `require.config({})`, sets the baseUrl for your modules (usually the directory your 'src' files are located in.

### Flags

Name: `build`

Specify this flag in order to rebuild the specrunner and not delete it. This is useful when troublshooting templates,
running in a browser, or as part of a watch chain for use in a web browser, e.g.

```js
  watch: {
    pivotal : {
      files: ['test/fixtures/pivotal/**/*.js'],
      tasks: 'jasmine:pivotal:build'
    }
  }
```

```js
  grunt.registerTask('dev', ['connect', 'watch']);
```



#### Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
jasmine : {
  pivotal : {
    src     : 'test/fixtures/pivotal/src/**/*.js'
    options : {
      specs   : 'test/fixtures/pivotal/spec/*Spec.js',
      helpers : 'test/fixtures/pivotal/spec/*Helper.js'
    }
  }
}
```

#### Supplying a custom template

Supplying a custom template to the above example

```js
jasmine : {
  customTemplate : {
    src : 'test/fixtures/pivotal/src/**/*.js',
    options : {
      specs   : 'test/fixtures/pivotal/spec/*Spec.js',
      helpers : 'test/fixtures/pivotal/spec/*Helper.js'
      template : 'test/fixtures/customTemplate/custom.tmpl'
    }
  }
}
```

#### Sample RequireJS usage

```js
jasmine : {
  requirejs : {
    src      : 'test/fixtures/requirejs/src/**/*.js',
    options : {
      specs    : 'test/fixtures/requirejs/spec/*Spec.js',
      helpers  : 'test/fixtures/requirejs/spec/*Helper.js',
      host     : 'http://127.0.0.1:<%= connect.port %>/',
      template : 'requirejs',
      templateOptions  : {
        baseUrl : './test/fixtures/requirejs/src/'
      }
    }
  }
}
```

#### RequireJS note

If you end up using the requirejs template, it's worth looking at the [RequireJS template](https://github.com/gruntjs/grunt-contrib-jasmine/blob/master/tasks/jasmine/templates/RequireJSRunner.tmpl) in order to
familiarize yourself with how it loads your files. The gist of it is:

```js
require([*YOUR SOURCE*], function() {
  require([*YOUR SPECS*], function() {
    require([*JASMINE FILES*], function() {
      // at this point your tests are already running.
    }
  }
}
```


## Release History

 * 2012-11-06 - v0.1.1 - Fixed race condition in requirejs template
 * 2012-11-06 - v0.1.0 - Ported grunt-jasmine-runner and grunt-jasmine-task to grunt-contrib

--
Task submitted by <a href="http://jarrodoverson.com">Jarrod Overson</a>.

*Generated on Thu Nov 08 2012 16:56:54.*
