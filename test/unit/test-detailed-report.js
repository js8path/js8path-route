/*
mocha tests for DetaileReport class
test-detailed-report.js
*/

/* global describe, it */
import _isObject from 'lodash/isObject'
import _keys from 'lodash/keys'
import _pick from 'lodash/pick'
import _isEqual from 'lodash/isEqual'

import moment from 'moment'

import js8pathRoute from '../../src/main.js'

// let Station = js8pathRoute.Station
// let LinkedStation = js8pathRoute.LinkedStation
// let DetailedPath = js8pathRoute.DetailedPath
let DetailedReport = js8pathRoute.DetailedReport

let chai = require('chai')
let assert = chai.assert

describe('js8path-route DetailedReport class', function () {
  let rr1 = {
    "timestamp": "2019-04-27T00:22:15Z",
    "freqHz": 7078574,
    // "band": '7',
    "sNR": -10,
    "rxCall": "AA1AA",
    "rxGrid": "EN61AA",
    "txCall": "AA2AC",
    "txGrid": "DM79BB"
  }

  let rr2 = {
    "timestamp": "2019-04-27T00:22:45Z",
    "freqHz": 70785784,
    // "band": '7',
    "sNR": -6,
    "rxCall": "AA2AC",
    "rxGrid": "DM79BB",
    "txCall": "AA1AA",
    "txGrid": "EN61AA"
  }

  describe('new DetailedReport() and getters', function () {
    describe ('no opts', function () {
      let detailedReport = new DetailedReport(rr1)
      it ('isDetailedReport', function () {
        assert.isOk(detailedReport.isDetailedReport)
      })
      it ('has rawReport', function () {
        assert.isOk(_isObject(detailedReport.rawReport), '.rawReport is object')
        assert.isOk(_isEqual(rr1, _pick(detailedReport.rawReport, _keys(rr1))), '.rawReport contains given rawReport')
        // console.log(JSON.stringify(detailedReport, null, 2))
        assert.deepEqual(detailedReport._optsOverrides, {}, '._optsOverrides')
        // values direct from raw report
        assert.equal(detailedReport.timestamp, '2019-04-27T00:22:15Z', '.timestamp')
        assert.equal(detailedReport.freqHz, 7078574, '.freqHz')
        assert.equal(detailedReport.sNR, -10, '.sNR')
        assert.equal(detailedReport.rxCall, 'AA1AA', '.rxCall')
        assert.equal(detailedReport.rxGrid, 'EN61AA', '.rxGrid')
        assert.equal(detailedReport.txCall, 'AA2AC', '.txCall')
        assert.equal(detailedReport.txGrid, 'DM79BB', '.txGrid')
        // values from processed report
        assert.equal(detailedReport.key, '2019-04-27T00:22:15Z|7|AA1AA|AA2AC|EN61AA|DM79BB||', '.key')
        assert.equal(detailedReport.band, '7', '.band')
        // computed values
        assert.deepEqual(detailedReport.rxStationKey, '|AA1AA|EN61AA|7|', '.rxStationKey')
        assert.isOk(_isObject(detailedReport.rxMaidenhead), '.rxMaidenhead is object')
        assert.isNumber(detailedReport.rxBearing, '.rxBearing')
        assert.deepEqual(detailedReport.txStationKey, '|AA2AC|DM79BB|7|', '.rxStationKey')
        assert.isOk(_isObject(detailedReport.txMaidenhead), '.txMaidenhead is object')
        assert.isNumber(detailedReport.txBearing, '.txBearing')
        assert.isNumber(detailedReport.distance, '.distance')
        assert.equal(detailedReport.reliability, 0, '.reliability')
      })
    })
    describe ('opts', function () {
      // FixMe: test more possible opts, and results of opts
      let detailedReport = new DetailedReport(rr1, { gridKeyLength: 4 })
      it ('has _optsOverrides', function () {
        assert.deepEqual(detailedReport._optsOverrides, { gridKeyLength: 4 }, '._optsOverrides')
      })
    })
  })

  describe('DetailedReport instance methods', function () {
    let dr1a = new DetailedReport(rr1)
    let dr1b = new DetailedReport(rr1)
    let dr2 = new DetailedReport(rr2)

    describe('.sameStationsAs()', function () {
      it ('is true for reports with same start and end stations', function () {
        assert.isOk(dr1a.sameStationsAs(dr1a))
        assert.isOk(dr1a.sameStationsAs(dr1b))
        assert.isOk(dr1b.sameStationsAs(dr1b))
        assert.isOk(dr1b.sameStationsAs(dr1a))
        assert.isOk(dr2.sameStationsAs(dr2))
      })
      it ('is false for reports with reversed start and end stations', function () {
        assert.isNotOk(dr1a.sameStationsAs(dr2))
        assert.isNotOk(dr2.sameStationsAs(dr1a))
        assert.isNotOk(dr1b.sameStationsAs(dr2))
        assert.isNotOk(dr2.sameStationsAs(dr1b))
      })
    })

    describe('.sameEndpointsAs()', function () {
      it ('is true for reports with same endpoints', function () {
        assert.isOk(dr1a.sameEndpointsAs(dr1a))
        assert.isOk(dr1a.sameEndpointsAs(dr1b))
        assert.isOk(dr1b.sameEndpointsAs(dr1b))
        assert.isOk(dr1b.sameEndpointsAs(dr1a))
        assert.isOk(dr2.sameEndpointsAs(dr2))
      })
      it ('is false for reports with different endpoints', function () {
        assert.isNotOk(dr1a.sameEndpointsAs(dr2))
        assert.isNotOk(dr1b.sameEndpointsAs(dr2))
        assert.isNotOk(dr2.sameEndpointsAs(dr1a))
        assert.isNotOk(dr2.sameEndpointsAs(dr1b))
      })
    })
  })


  describe('DetailedReport.reliabilityComputationFn()', function () {
    let detailedReport = new DetailedReport(rr1)
    let rcFn = DetailedReport.reliabilityComputationFn
    it ('computes AsExpected', function () {
      // FixMe: more calculation examples: test limits, etc
      assert.equal(
        rcFn(detailedReport, moment('2019-04-27T00:52:15Z')),
        0.25,
        '0.5 * 0.5'
      )
    })
  })
})
