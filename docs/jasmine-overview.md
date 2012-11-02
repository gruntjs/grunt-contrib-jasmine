# Overview

grunt-contrib-jasmine automatically builds and maintains your spec runner and runs your tests headlessly through
phantomjs

Substantial credit goes to [Camille Reynders](http://creynders.be/) (@creynders) for the first decent implementation
of jasmine through grunt which served as motivation for all the future work.

## Run specs locally or on an ad hoc server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

## AMD Support

Includes a SpecRunner template customized for use with AMD modules and requirejs.

## Customize your SpecRunner with your own template

Supply your own underscore template to automatically build your SpecRunner custom to your use.

# Flags

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

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect

