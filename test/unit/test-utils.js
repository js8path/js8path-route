/* mocha tests for Js8path route utils
test-utils.js
*/

/* global describe, it */
import _cloneDeep from 'lodash/cloneDeep'
import _forEach from 'lodash/forEach'

// import js8pathData from 'js8path-data'
// import exampleReceptionReports from '../../scripts/data/data_js8path.json'

import js8pathRoute from '../../src/main.js'
let utils = js8pathRoute.utils

let chai = require('chai')
let assert = chai.assert

describe('js8path-route utils', function () {
  describe('utils.bandFromHz()', function () {
    let allTestData = [
      {freqHz: 7078000, band: '7', comment: 'valid ham freq'},
      {freqHz: 999, band: '0', comment: '< 1MHz'},
      {freqHz: -1000, band: '??', comment: '< 0'}
    ]
    it ('computes band from MHz', function () {
      _forEach(allTestData, function (testData) {
        let band =  utils.bandFromHz(testData.freqHz)
        assert.equal(band, testData.band, JSON.stringify([band, testData], null, 2))
      })
    })
  })

  describe('utils.addReportToList()', function () {
    let rr1 = {
      "timestamp": "2019-04-27T00:22:15Z",
      "freqHz": 7078574,
      "band": '7',
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    let rr2 = {
      "timestamp": "2019-04-27T00:22:30Z",
      "freqHz": 7078574,
      "band": '7',
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    let reportsList = []

    utils.addReportToList(reportsList, rr1)
    utils.addReportToList(reportsList, rr2)
    it('adds new reports', function () {
      assert.deepEqual(reportsList, [rr1, rr2])
    })

    utils.addReportToList(reportsList, _cloneDeep(rr1))
    utils.addReportToList(reportsList, _cloneDeep(rr2))
    it('does not add duplicate reports', function () {
      assert.deepEqual(reportsList, [rr1, rr2])
    })
  })

  describe('utils.deduplicateReportList()', function () {
    let rr1 = {
      "timestamp": "2019-04-27T00:22:15Z",
      "freqHz": 7078574,
      "band": '7',
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    let rr2 = {
      "timestamp": "2019-04-27T00:22:30Z",
      "freqHz": 7078574,
      "band": '7',
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }

    it('removes duplicate reports from a list', function () {
      let reportsList1 = [rr1, rr2, rr1, rr2, _cloneDeep(rr1), _cloneDeep(rr2)]
      let reportsList2 = utils.deduplicateReportList(reportsList1)
      assert.deepEqual(reportsList2, [rr1, rr2])
    })
  })
})
