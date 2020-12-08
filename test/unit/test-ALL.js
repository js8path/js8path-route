/*
run all mocha unit tests for js8path-pskreporter
test-ALL.js
*/

/* global describe */

// es6-promise polyfill needed for IE and other platforms without native ES6 Promise
import es6Promise from 'es6-promise'
es6Promise.polyfill()

describe('All js8path-pskreporter unit tests', function () {
  require('./test-linked-station.js')
  require('./test-detailed-path.js')
  require('./test-detailed-report.js')
  require('./test-router.js')
  require('./test-station.js')
  require('./test-station-paths.js')
  require('./test-utils.js')
  require('./test-big-data-routing.js')
})
