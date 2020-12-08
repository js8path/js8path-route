/* Js8path router class methods
mocha tests for router
test-router-class-methods.js
*/

/* global describe, it */
// import _cloneDeep from 'lodash/cloneDeep'

import js8pathData from '@js8path/js8path-data'
import js8pathRoute from '../../src/main.js'
let Router = js8pathRoute.Router

let chai = require('chai')
let assert = chai.assert

describe('js8path-route Router class methods', function () {
  describe('report processing', function () {
    let rrFull = {
      "timestamp": "2019-11-23T01:39:30Z",
      "freqHz": 7078500,
      "sNR": 14,
      "rxCall": "AL7BX/H",
      "rxGrid": "DM37KR89XC",
      "txCall": "AL7BX/I",
      "txGrid": "DM37KR",
      "srcType": "pskreporter",
      "srcData": {
        "receiverCallsign": "AL7BX/H",
        "receiverLocator": "DM37KR89XC",
        "senderCallsign": "AL7BX/I",
        "senderLocator": "DM37KR",
        "frequencyHz": 7078500,
        "flowStartSeconds": 1574473170,
        "mode": "JS8",
        "senderDXCC": "Italy",
        "senderDXCCCode": "I",
        "senderDXCCLocator": "JN62",
        "sNRString": "14",
        "sNR": 14
      }
    }
    let rrProcessed = {
      "timestamp": "2019-11-23T01:39:30Z",
      "freqHz": 7078500,
      "sNR": 14,
      "rxCall": "AL7BX/H",
      "rxGrid": "DM37KR89XC",
      "txCall": "AL7BX/I",
      "txGrid": "DM37KR",
      "srcType": "pskreporter",
      "band": '7',
      _key: "2019-11-23T01:39:30Z|7|AL7BX/H|AL7BX/I|DM37KR89XC|DM37KR||pskreporter"
    }
    let rrBad = { // (no freqHz)
      "timestamp": "2019-11-23T01:39:31Z",
      "sNR": 14,
      "rxCall": "AL7BX/H",
      "rxGrid": "DM37KR89XC",
      "txCall": "AL7BX/I",
      "txGrid": "DM37KR"
    }

    describe('Router.processReport()', function () {
      it ('removes source information from reception report', function () {
        let rr = Router.processReport(rrFull)
        assert.deepEqual(rr, rrProcessed, JSON.stringify([rr, rrProcessed], null, 2))
      })

      it ('returns invalid report as null', function () {
        let rr = Router.processReport(rrBad)
        assert.equal(rr, null)
      })
    })

    describe('Router.processReportList()', function () {
      it ('process reports and removes bad', function () {
        let processedReports = Router.processReportList([rrFull, rrProcessed, rrBad])
        assert.deepEqual(processedReports, [rrProcessed])
      })
    })
  })
})
