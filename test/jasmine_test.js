'use strict';

var grunt = require('grunt');

// Majority of test benefit comes from running the task itself.
// This is kept around for future use.

exports.jasmine = {
  request: function(test) {
    test.expect(0);
    test.done();
  }
};
