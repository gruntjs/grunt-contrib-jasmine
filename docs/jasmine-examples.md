

## Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js'
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
}
```

## Supplying a custom template

Supplying a custom template to the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
        template: 'custom.tmpl'
      }
    }
  }
}
```

## Sample RequireJS usage

Please see the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs)
