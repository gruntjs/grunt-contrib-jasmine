
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

**'requirejs'** default templateOptions :

```js
  requirejs : __dirname + '/../vendor/require-#.#.#.js',
  baseUrl   : ''
```

- requirejs : the location of the included requirejs.
- baseUrl : set in `require.config({})`, sets the baseUrl for your modules (usually the directory your 'src' files are located in.

