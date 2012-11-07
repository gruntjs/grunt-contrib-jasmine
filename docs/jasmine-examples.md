

## Basic Use

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

## Supplying a custom template

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

## Sample RequireJS usage

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

## RequireJS note

If you end up using the requirejs template, it's worth looking at the [RequireJS template](blob/master/tasks/jasmine/templates/RequireJSRunner.tmpl) in order to
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
