Automatically builds and maintains your spec runner and runs your tests headlessly through phantomjs.

Substantial credit goes to [Camille Reynders](http://www.creynders.be/) (@creynders) for the first decent implementation
of jasmine through grunt which served as motivation for all the future work.

## Run specs locally or on an ad hoc server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

## Customize your SpecRunner with templates

Supply your templates that will be used to automatically build the SpecRunner.

### AMD Support

Supports AMD tests via the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) module

### Third party templates

- [RequireJS](https://github.com/jsoverson/grunt-template-jasmine-requirejs)
- [Code coverage output with Istanbul](https://github.com/maenu/grunt-template-jasmine-istanbul)
- [StealJS](https://github.com/jaredstehler/grunt-template-jasmine-steal)

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect

