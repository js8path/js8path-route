/* Js8path router
mocha tests for router class constructor
test-router-constructor.js
*/

/* global describe, it */
import _isNull from 'lodash/isNull'

import js8pathRoute from '../../src/main.js'
let Router = js8pathRoute.Router

let chai = require('chai')
let assert = chai.assert

describe('js8path-route Router class constructors', function () {
  describe('new Router()', function () {
    it('is initialized with no opts', function () {
      let router = new Router()
      assert.deepEqual(router.opts, Router.routerOptsDefault)
      assert.isOk(_isNull(router.oldestReport))
      assert.isOk(_isNull(router.latestReport))
      assert.deepEqual(router.stations, {})
    })

    it('is initialized with given opts', function () {
      let optsTest = {abc: 'def', gridKeyLength: 4}
      let router = new Router(optsTest)
      assert.deepEqual(router.opts, optsTest)
      assert.isOk(_isNull(router.oldestReport))
      assert.isOk(_isNull(router.latestReport))
      assert.deepEqual(router.stations, {})
    })
  })
})
