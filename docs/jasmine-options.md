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

This is the auto-generated specfile that phantomjs will use to run your tests. This is automatically deleted upon normal
runs

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
Type: `String`
Default: `default`
Options: `default`, `requirejs`, `yourcustomtemplate.tmpl`

Specify a custom template to use when generating your Spec Runner. Templates are parsed as underscore templates and provided
the expanded list of files needed to build a specrunner.

## options.templateOptions
Type: `Object`
Default: `{}`

These options will be passed to your template as an 'options' hash so that you can provide settings to your template.

## options.junit
Type: `Object`
Default: `{}`

Set `options.junit.path` to generate JUnit compatible XML from the task (for use in a CI system such as Jenkins).

Set `options.junit.consolidate` to consolidate the generated XML files so that there is one file per top level suite.

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

# Template Options

## Default template

No specific options are expected or used.

## RequireJS template

### templateOptions.requirejs
Type: `String`

The path to requirejs if you need to specify an alternate version.

### templateOptions.loaderPlugin
Type: `String`

The loader plugin to prefix all loaded `src` files. This is useful for processing
your specs through the likes of CoffeeScript or TypeScript plugins. Keep in mind
you will need to specify the path to the plugin in the require config.

### templateOptions.requireConfig
Type: `Object`

This object is `JSON.stringify()`-ed into the template and passed into `require.config()`

