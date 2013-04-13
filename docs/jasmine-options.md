# Options

## src
Type: `String|Array`

*Minimatch* - Your source files. These are the files that you are testing.

## options.specs
Type: `String|Array`

*Minimatch* - Your Jasmine specs.

## options.vendor
Type: `String|Array`

*Minimatch* - Third party libraries, generally loaded before anything else happens in your tests. Libraries
like jQuery and Backbone.

## options.helpers
Type: `String|Array`

*Minimatch* - Non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

## options.styles
Type: `String|Array`

*Minimatch* - CSS files that get loaded after the jasmine.css

## options.version
Type: `String`
Default: '1.3.1'

This is the jasmine-version which will be used. currently available versions are:

* 1.0.0
* 1.1.0
* 1.2.0
* 1.3.0
* 1.3.1

## options.outfile
Type: `String`
Default: `_SpecRunner.html`

The auto-generated specfile that phantomjs will use to run your tests.
Automatically deleted upon normal runs

## options.keepRunner
Type: `Boolean`
Default: `false`

Prevents the auto-generated specfile used to run your tests from being automatically deleted.

## options.junit.path
Type: `String`
Default: undefined

Path to output JUnit xml

## options.junit.consolidate
Type: `Boolean`
Default: `false`

Consolidate the JUnit XML so that there is one file per top level suite.

## options.host
Type: `String`
Default: ''

The host you want phantomjs to connect against to run your tests.

e.g. if using an ad hoc server from within grunt

```js
host : 'http://127.0.0.1:8000/'
```

Or, using templates

```js
host : 'http://127.0.0.1:<%= connect.port %>/'
```

Not defining a host will mean your specs will be run from the local filesystem.

## options.template
Type: `String` `Object`
Default: undefined

Custom template used to generate your Spec Runner. Parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

You can specify an object with a `process` method that will be called as a template function.
See the [Template API Documentation](https://github.com/gruntjs/grunt-contrib-jasmine/wiki/Jasmine-Templates) for more details.

## options.templateOptions
Type: `Object`
Default: `{}`

Options that will be passed to your template via an 'options' hash. Used to pass settings to the template.

# Flags

Name: `build`

Turn on this flag in order to rebuild the specrunner without deleting it. This is useful when troubleshooting templates,
running in a browser, or as part of a watch chain e.g.

```js
watch: {
  pivotal : {
    files: ['src/**/*.js', 'specs/**/*.js'],
    tasks: 'jasmine:pivotal:build'
  }
}
```
