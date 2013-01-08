# Options

## src
Type: `String|Array`

*Minimatch* - This defines your source files. These are the files that you are testing.

## options.specs
Type: `String|Array`

*Minimatch* - These are your Jasmine specs.

## options.vendor
Type: `String|Array`

*Minimatch* - These are third party libraries, generally loaded before anything else happens in your tests. You'll likely add things
like jQuery and Backbone here.

## options.helpers
Type: `String|Array`

*Minimatch* - These are non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

## options.outfile
Type: `String`
Default: `_SpecRunner.html`

This is the auto-generated specfile that phantomjs will use to run your tests.
This is automatically deleted upon normal runs

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

## options.template
Type: `String` `Object`
Default: undefined

Specify a custom template used to generate your Spec Runner. Templates are parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

You can specify an object with a `process` method that will be called as a template function.
See the [Template API Documentation](needs-wiki-link) for more details.

## options.templateOptions
Type: `Object`
Default: `{}`

These options will be passed to your template as an 'options' hash so that you can provide settings to your template.

# Flags

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
