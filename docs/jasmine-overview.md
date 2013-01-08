# Overview

grunt-contrib-jasmine automatically builds and maintains your spec runner and runs your tests headlessly through
phantomjs

Substantial credit goes to [Camille Reynders](http://creynders.be/) (@creynders) for the first decent implementation
of jasmine through grunt which served as motivation for all the future work.

## Run specs locally or on an ad hoc server

Run your tests on your local filesystem or via a server task like [grunt-contrib-connect][].

## AMD Support

Supports AMD tests via the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) module

## Customize your SpecRunner with your own template

Supply your templates that will be used to automatically build the SpecRunner.

## Example application usage

- [Pivotal Labs' sample application](https://github.com/jsoverson/grunt-contrib-jasmine-example)

[grunt-contrib-connect]: https://github.com/gruntjs/grunt-contrib-connect

