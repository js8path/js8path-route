/*
run all mocha integration tests for @js8path/js8path-route
inttest-ALL.js
*/

/* global describe, it */

// es6-promise polyfill needed for IE and other platforms without native ES6 Promise
import es6Promise from 'es6-promise'
es6Promise.polyfill()

let chai = require('chai')
let assert = chai.assert

describe('@js8path/js8path-route integration tests', function () {
  it ('has no integration tests', function () {
    assert.isOk(true)
  })
  // require('./inttest-route.js')
})

