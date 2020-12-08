/* Js8path route
mocha tests for Station class
test-station.js
*/

/* global describe, it */
// import _cloneDeep from 'lodash/cloneDeep'

import js8pathRoute from '../../src/main.js'

let Station = js8pathRoute.Station
let LinkedStation = js8pathRoute.LinkedStation

let chai = require('chai')
let assert = chai.assert

describe('js8path-route LinkedStation class', function () {
  let station2 = new Station('A2C', 'EN22', 7)

  describe('new LinkedStation()', function () {
    describe ('no previous or next station', function () {
      let linkedStation = new LinkedStation(station2)
      it ('isLinkedStation', function () {
        assert.isOk(linkedStation.isLinkedStation, 'isLinkedStation')
      })
      it ('matches the given station', function () {
        assert.equal(linkedStation.station.call, station2.call, 'call')
        assert.equal(linkedStation.station.grid, station2.grid, 'grid')
        assert.equal(linkedStation.station.band, station2.band, 'band')
        assert.equal(linkedStation.station.key, station2.key, 'key')
        assert.equal(linkedStation.station.maidenhead.locator, station2.maidenhead.locator, 'maidenhead')
        assert.isOk(linkedStation.station.sameStationAs(station2), 'compare station')
      })
      it ('has getters for given station params', function () {
        assert.equal(linkedStation.call, station2.call, 'call')
        assert.equal(linkedStation.grid, station2.grid, 'grid')
        assert.equal(linkedStation.band, station2.band, 'band')
        assert.equal(linkedStation.key, station2.key, 'key')
        assert.equal(linkedStation.maidenhead.locator, station2.maidenhead.locator, 'maidenhead.locator')
      })
      it ('has null previous station', function () {
        assert.isNull(linkedStation.prevStation, 'prevStation')
        assert.isNull(linkedStation.distanceToPrev, 'distanceToPrev')
        assert.isNull(linkedStation.bearingToPrev, 'distanceToPrev')
        assert.isNull(linkedStation.bearingFromPrev, 'distanceToPrev')
      })
      it ('has null next station', function () {
        assert.isNull(linkedStation.nextStation, 'nextStation')
        assert.isNull(linkedStation.distanceToNext, 'distanceToNext')
        assert.isNull(linkedStation.bearingToNext, 'distanceToNext')
        assert.isNull(linkedStation.bearingFromNext, 'distanceToNext')
      })
    })

    let station1 = new Station('A1B', 'DL82', 7)
    let dist21 = station2.maidenhead.distanceTo(station1.maidenhead)
    let bear21 = station2.maidenhead.bearingTo(station1.maidenhead)
    let bear12 = station1.maidenhead.bearingTo(station2.maidenhead)
    let station3 = new Station('A3B', 'FM19', 7)
    let dist23 = station2.maidenhead.distanceTo(station3.maidenhead)
    let bear23 = station2.maidenhead.bearingTo(station3.maidenhead)
    let bear32 = station3.maidenhead.bearingTo(station2.maidenhead)

    describe ('with previous and next station', function () {
      let linkedStation = new LinkedStation(station2, station1, station3)
      it ('isLinkedStation', function () {
        assert.isOk(linkedStation.isLinkedStation, 'isLinkedStation')
      })
      it ('matches the given station', function () {
        assert.equal(linkedStation.station.call, station2.call, 'call')
        assert.equal(linkedStation.station.grid, station2.grid, 'grid')
        assert.equal(linkedStation.station.band, station2.band, 'band')
        assert.equal(linkedStation.station.key, station2.key, 'key')
        assert.equal(linkedStation.station.maidenhead.locator, station2.maidenhead.locator, 'maidenhead')
        assert.isOk(linkedStation.station.sameStationAs(station2), 'compare station')
      })
      it ('has getters for given station params', function () {
        assert.equal(linkedStation.call, station2.call, 'call')
        assert.equal(linkedStation.grid, station2.grid, 'grid')
        assert.equal(linkedStation.band, station2.band, 'band')
        assert.equal(linkedStation.key, station2.key, 'key')
        assert.equal(linkedStation.maidenhead.locator, station2.maidenhead.locator, 'maidenhead.locator')
      })
      it ('has  previous station', function () {
        assert.isOk(linkedStation.prevStation.sameStationAs(station1), 'prevStation')
        assert.equal(linkedStation.distanceToPrev, dist21, 'distanceToPrev')
        assert.equal(linkedStation.bearingToPrev, bear21, 'bearingToPrev')
        assert.equal(linkedStation.bearingFromPrev, bear12, 'bearingFromPrev')
      })
      it ('has next station', function () {
        assert.isOk(linkedStation.nextStation.sameStationAs(station3), 'nextStation')
        assert.equal(linkedStation.distanceToNext, dist23, 'distanceToNext')
        assert.equal(linkedStation.bearingToNext, bear23, 'bearingToNext')
        assert.equal(linkedStation.bearingFromNext, bear32, 'bearingFromNext')
      })
    })

    describe ('linkedStation.txTo()', function () {
      let report21a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A1B',
        "rxGrid": 'DL82',
        "txCall": 'A2C',
        "txGrid": 'EN22'
      }

      it ('has no txTo if station has no txTo', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let linkedStation = new LinkedStation(station2, station1)
        assert.deepEqual(station2.txTo, {}, 'station.txTo')
        assert.deepEqual(linkedStation.txTo, {}, 'linkedStation.txTo')
      })

      it ('has same txTo as station', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let linkedStation = new LinkedStation(station2, station1)
        station2.addTxTo(station1, report21a)
        let txToExpected = {}
        txToExpected[station1.key] = {station: station1, reports: [report21a]}
        assert.deepEqual(station2.txTo, txToExpected, 'station.txTo')
        assert.deepEqual(station2.txTo, linkedStation.txTo, 'station.txTo')
      })
    })

    describe ('linkedStation.rxFrom()', function () {
      let report12a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A2C',
        "rxGrid": 'EN22',
        "txCall": 'A1B',
        "txGrid": 'DL82'
      }

      it ('has no txTo if station has no rxFrom', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let linkedStation = new LinkedStation(station2, station1)
        assert.deepEqual(station2.rxFrom, {}, 'station.txTo')
        assert.deepEqual(linkedStation.rxFrom, {}, 'linkedStation.txTo')
      })

      it ('has same rxFrom as station', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let linkedStation = new LinkedStation(station2, station1)
        station2.addRxFrom(station1, report12a)
        let rxFromExpected = {}
        rxFromExpected[station1.key] = {station: station1, reports: [report12a]}
        assert.deepEqual(station2.rxFrom, rxFromExpected, 'station.rxFrom')
        assert.deepEqual(station2.rxFrom, linkedStation.rxFrom, 'linkedStation.rxFrom')
      })
    })

    describe ('linkedStation.reports[To|From][Prev|Next]', function () {
      let report21a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A1B',
        "rxGrid": 'DL82',
        "txCall": 'A2C',
        "txGrid": 'EN22'
      }
      let report21b = {
        "timestamp": "2019-04-27T00:23:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -7,
        "rxCall": 'A1B',
        "rxGrid": 'DL82',
        "txCall": 'A2C',
        "txGrid": 'EN22'
      }
      let report12a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A2C',
        "rxGrid": 'EN22',
        "txCall": 'A1B',
        "txGrid": 'DL82'
      }
      let report12b = {
        "timestamp": "2019-04-27T00:23:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -7,
        "rxCall": 'A2C',
        "rxGrid": 'EN22',
        "txCall": 'A1B',
        "txGrid": 'DL82'
      }
      let report23a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A3B',
        "rxGrid": 'FM19',
        "txCall": 'A2C',
        "txGrid": 'EN22'
      }
      let report23b = {
        "timestamp": "2019-04-27T00:23:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -7,
        "rxCall": 'A3B',
        "rxGrid": 'FM19',
        "txCall": 'A2C',
        "txGrid": 'EN22'
      }
      let report32a = {
        "timestamp": "2019-04-27T00:22:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -6,
        "rxCall": 'A2C',
        "rxGrid": 'EN22',
        "txCall": 'A3B',
        "txGrid": 'FM19'
      }
      let report32b = {
        "timestamp": "2019-04-27T00:23:30Z",
        "freqHz": 7078574,
        "band": '7',
        "sNR": -7,
        "rxCall": 'A2C',
        "rxGrid": 'EN22',
        "txCall": 'A3B',
        "txGrid": 'FM19'
      }

      it ('initially has no [To|From][Prev|Next]', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let station3 = new Station('A3B', 'FM19', 7)
        let linkedStation = new LinkedStation(station2, station1, station3)
        assert.deepEqual(linkedStation.reportsToPrev, [], 'reportsToPrev')
        assert.deepEqual(linkedStation.reportsFromPrev, [], 'reportsFromPrev')
        assert.deepEqual(linkedStation.reportsToNext, [], 'reportsToNext')
        assert.deepEqual(linkedStation.reportsFromNext, [], 'reportsFromNext')
      })

      it ('has one added reports[To|From][Prev|Next]', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let station3 = new Station('A3B', 'FM19', 7)
        station2.addTxTo(station1, report21a)
        station2.addRxFrom(station1, report12a)
        station2.addTxTo(station3, report23a)
        station2.addRxFrom(station3, report32a)
        let linkedStation = new LinkedStation(station2, station1, station3)
        assert.deepEqual(linkedStation.reportsToPrev, [report21a], 'reportsToPrev')
        assert.deepEqual(linkedStation.reportsFromPrev, [report12a], 'reportsFromPrev')
        assert.deepEqual(linkedStation.reportsToNext, [report23a], 'reportsToNext')
        assert.deepEqual(linkedStation.reportsFromNext, [report32a], 'reportsFromNext')
      })

      it ('has two added reports[To|From][Prev|Next]', function () {
        let station1 = new Station('A1B', 'DL82', 7)
        let station2 = new Station('A2C', 'EN22', 7)
        let station3 = new Station('A3B', 'FM19', 7)
        station2.addTxTo(station1, report21a)
        station2.addTxTo(station1, report21b)
        station2.addRxFrom(station1, report12a)
        station2.addRxFrom(station1, report12b)
        station2.addTxTo(station3, report23a)
        station2.addTxTo(station3, report23b)
        station2.addRxFrom(station3, report32a)
        station2.addRxFrom(station3, report32b)
        let linkedStation = new LinkedStation(station2, station1, station3)
        assert.deepEqual(linkedStation.reportsToPrev, [report21a, report21b], 'reportsToPrev')
        assert.deepEqual(linkedStation.reportsFromPrev, [report12a, report12b], 'reportsFromPrev')
        assert.deepEqual(linkedStation.reportsToNext, [report23a, report23b], 'reportsToNext')
        assert.deepEqual(linkedStation.reportsFromNext, [report32a, report32b], 'reportsFromNext')
      })
    })
  })
})
