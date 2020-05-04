## Example application usage

- [Pivotal Labs' sample application](https://github.com/jsoverson/grunt-contrib-jasmine-example)


## Basic Use

Sample configuration to run Pivotal Labs' example Jasmine application.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
});
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
        helpers: 'spec/*Helper.js',
        template: 'custom.tmpl'
      }
    }
  }
});
```

## Supplying template modules and vendors

A complex version for the above example

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: require('exports-process.js'),
        vendor: [
          'vendor/*.js',
          'http://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js'
        ]
      }
    }
  }
});
```

## Passing options to sandbox (puppeteer)

See [puppeteer launch options](https://pptr.dev/#?product=Puppeteer&version=v3.0.1&show=api-puppeteerlaunchoptions) for a complete list of arguments.

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    customTemplate: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js',
        template: 'custom.tmpl',
        sandboxArgs: {
          args: ['--no-sandbox'],
          timeout: 3000,
          defaultViewport: {
            isMobile: true
          }
        }
      }
    }
  }
});
```

## Sample RequireJS/NPM Template usage

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    yourTask: {
      src: 'src/**/*.js',
      options: {
        specs: 'spec/*Spec.js',
        template: require('grunt-template-jasmine-requirejs')
      }
    }
  }
});
```

NPM Templates are just node modules, so you can write and treat them as such.

Please see the [grunt-template-jasmine-requirejs](https://github.com/jsoverson/grunt-template-jasmine-requirejs) documentation
for more information on the RequireJS template.

## Keeping temp files in an existing directory

Supplying a custom temp directory

```js
// Example configuration
grunt.initConfig({
  jasmine: {
    pivotal: {
      src: 'src/**/*.js',
      options: {
        keepRunner: true,
        tempDir: 'bin/jasmine/',
        specs: 'spec/*Spec.js',
        helpers: 'spec/*Helper.js'
      }
    }
  }
});
```
