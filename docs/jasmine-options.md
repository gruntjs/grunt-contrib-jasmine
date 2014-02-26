# Options

## src
Type: `String|Array`

Your source files. These are the files that you are testing.

## options.specs
Type: `String|Array`

Your Jasmine specs.

## options.vendor
Type: `String|Array`

Third party libraries like jQuery & generally anything loaded before source, specs, and helpers.

## options.helpers
Type: `String|Array`

Non-source, non-spec helper files. In the default runner these are loaded after `vendor` files

## options.styles
Type: `String|Array`

CSS files that get loaded after the jasmine.css

## options.version
Type: `String`  
Default: '2.0.0'

This is the jasmine-version which will be used. currently available versions are:

* 2.0.0

*Due to changes in Jasmine, pre-2.0 versions have been dropped and tracking will resume at 2.0.0*

## options.outfile
Type: `String`  
Default: `_SpecRunner.html`

The auto-generated specfile that phantomjs will use to run your tests.
Automatically deleted upon normal runs. Use the `:build` flag to generate a SpecRunner manually e.g.
`grunt jasmine:myTask:build`

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

The host you want PhantomJS to connect against to run your tests.

e.g. if using an ad hoc server from within grunt

```js
host : 'http://127.0.0.1:8000/'
```

Without a `host`, your specs will be run from the local filesystem.

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

Options that will be passed to your template. Used to pass settings to the template.

## options.display
Type: `String`  
Default: `full`

  * `full` displays the full specs tree
  * `short` only displays a success or failure character for each test (useful with large suites)

# Flags

Name: `build`

Turn on this flag in order to build a SpecRunner html file. This is useful when troubleshooting templates,
running in a browser, or as part of a watch chain e.g.

```js
watch: {
  pivotal : {
    files: ['src/**/*.js', 'specs/**/*.js'],
    tasks: 'jasmine:pivotal:build'
  }
}
```

# Filtering specs

**filename**
`grunt jasmine --filter=foo` will run spec files that have `foo` in their file name.

**folder**
`grunt jasmine --filter=/foo` will run spec files within folders that have `foo*` in their name.

**wildcard**
`grunt jasmine --filter=/*-bar` will run anything that is located in a folder `*-bar`

**comma separated filters**
`grunt jasmine --filter=foo,bar` will run spec files that have `foo` or `bar` in their file name.

**flags with space**
`grunt jasmine --filter="foo bar"` will run spec files that have `foo bar` in their file name.
`grunt jasmine --filter="/foo bar"` will run spec files within folders that have `foo bar*` in their name.
