/* Js8path route
mocha tests for Station class
test-station.js
*/

/* global describe, it */
// import _cloneDeep from 'lodash/cloneDeep'

import js8pathRoute from '../../src/main.js'
import _forEach from 'lodash/forEach'

let Station = js8pathRoute.Station
let Router = js8pathRoute.Router

let chai = require('chai')
let assert = chai.assert

describe('js8path-route Station class', function () {
  describe('new Station()', function () {
    it ('is initialized with default params', function () {
      let station = new Station()
      assert.equal('', station.call, 'default call')
      assert.equal('', station.grid, 'default grid')
      assert.equal('', station.band, 'default band')
      assert.equal('||||', station.key, 'generated key')
      assert.isNull(station.maidenhead, 'null maidenhead')
      assert.deepEqual({}, station.txTo, 'initial txTo')
      assert.deepEqual({}, station.rxFrom, 'initial rxFrom')
      assert.deepEqual(Station.stationOptsDefault, station.opts, 'default opts')
      assert.isNotOk(station.isLinkedStation, 'isLinkedStation')
    })

    it ('is initialized with no opts', function () {
      let station = new Station('abc', 'FM19', 7)
      assert.equal('abc', station.call, 'given call')
      assert.equal('FM19', station.grid, 'given grid')
      assert.equal('7', station.band, 'given band')
      assert.equal('|ABC|FM19|7|', station.key, 'generated key')
      assert.equal('FM19', station.maidenhead.locator, 'maidenhead locator')
      assert.deepEqual({}, station.txTo, 'initial txTo')
      assert.deepEqual({}, station.rxFrom, 'initial rxFrom')
      assert.deepEqual(Station.stationOptsDefault, station.opts, 'default opts')
      assert.isNotOk(station.isLinkedStation, 'isLinkedStation')
    })

    it ('is initialized with given opts', function () {
      let optsTest = { pqr: 'stu', gridKeyLength: 4 }
      let station = new Station('abc', 'FM19', 7, optsTest)
      assert.equal('abc', station.call, 'given call')
      assert.equal('FM19', station.grid, 'given grid')
      assert.equal('7', station.band, 'given band')
      assert.equal('|ABC|FM19|7|', station.key, 'generated key')
      assert.equal('FM19', station.maidenhead.locator, 'maidenhead locator')
      assert.deepEqual({}, station.txTo, 'initial txTo')
      assert.deepEqual({}, station.rxFrom, 'initial rxFrom')
      assert.deepEqual(optsTest, station.opts, 'given opts')
      assert.isNotOk(station.isLinkedStation, 'isLinkedStation')
    })
  })

  describe('Station instance methods', function () {
    describe('station.stationData()', function () {
      let station1 = new Station('AA2AC', 'DM79', '7')
      it('returns station data', function () {
        assert.deepEqual(
          station1.stationData(),
          {call: 'AA2AC', grid: 'DM79', band: '7', key: station1.key}
        )
      })
    })

    describe('station.sameStationAs', function () {
      let station1 = new Station('AA2AC', 'DM79', '7')
      it('is same station as self', function () {
        assert.isOk(station1.sameStationAs(station1))
      })
      it('is same as station with same constructor params', function () {
        let station2 = new Station('AA2AC', 'DM79', '7')
        assert.isOk(station1.sameStationAs(station2))
      })
      it('is not same matches station with different call', function () {
        let station2 = new Station('AA2AD', 'DM79', '7')
        assert.isNotOk(station1.sameStationAs(station2))
      })
      it('is not same matches station with different grid', function () {
        let station2 = new Station('AA2AC', 'DM80', '7')
        assert.isNotOk(station1.sameStationAs(station2))
      })
      it('is not same matches station with different band', function () {
        let station2 = new Station('AA2AC', 'DM79', '10')
        assert.isNotOk(station1.sameStationAs(station2))
      })
    })

    describe('station linkInfo()', function () {
      let rrList = [
        {
          "timestamp": "2019-04-27T00:22:15Z",
          "freqHz": 7078574, "band": '7', "sNR": -6,
          "rxCall": "A1A", "rxGrid": "EN61",
          "txCall": "A1B", "txGrid": "DM79"
        },
        {
          "timestamp": "2019-04-27T00:22:30Z",
          "freqHz": 7078574, "band": '7', "sNR": -6,
          "rxCall": "A1A", "rxGrid": "EN61",
          "txCall": "A1B", "txGrid": "DM79"
        },
        {
          "timestamp": "2019-04-27T00:22:45Z",
          "freqHz": 7078574, "band": '7', "sNR": -6,
          "rxCall": "A1A", "rxGrid": "EN61",
          "txCall": "A1C", "txGrid": "DM80"
        },
        {
          "timestamp": "2019-04-27T00:23:00Z",
          "freqHz": 7078574, "band": '7', "sNR": -6,
          "rxCall": "A1D", "rxGrid": "DM81",
          "txCall": "A1A", "txGrid": "EN61"
        },
        {
          "timestamp": "2019-04-27T00:23:15Z",
          "freqHz": 7078574, "band": '7', "sNR": -6,
          "rxCall": "A1C", "rxGrid": "DM80",
          "txCall": "A1A", "txGrid": "EN61"
        }
      ]
      let router = new Router()
      it('has expected linkInfo', function () {
        return router.loadReports(rrList).then(function (loadedCount) {
          assert.equal(loadedCount, 5)
          // console.log(_keys(router.stations))
          let station1 = router.lookupAddStation(new Station('A1A', 'EN61', '7'))
          let linkInfo1 = station1.linkInfo()
          // console.log(JSON.stringify(linkInfo1, null, 2))
          assert.deepEqual(linkInfo1.station, station1.stationData(), 'station data')
          assert.equal(linkInfo1.canTxTo.length, 2, 'canTxTo.length')
          assert.equal(linkInfo1.canRxFrom.length, 2, 'canRxFrom.length')
          assert.equal(linkInfo1.canQsoWith.length, 1, 'canQsoWith.length')
          assert.equal(linkInfo1.canQsoWith[0].call, 'A1C', 'canQsoWith.station.call')
        })
      })
    })

    describe('station addTxTo() & addRxFrom()', function () {
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
      let txStation = new Station('AA2AC', 'DM79', '7')
      let rxStation = new Station('AA1AA', 'EN61', '7')
      txStation.addTxTo(rxStation, rr1)
      rxStation.addRxFrom(txStation, rr1)
      txStation.addTxTo(rxStation, rr2)
      rxStation.addRxFrom(txStation, rr2)
      it('adds stations as expected', function () {
        assert.equal(txStation.txTo[rxStation.key].station.key, rxStation.key, 'txTo station')
        assert.equal(rxStation.rxFrom[txStation.key].station.key, txStation.key, 'rxFrom station')
        assert.deepEqual(txStation.txTo[rxStation.key].reports, [rr1, rr2], 'txTo reports')
        assert.deepEqual(rxStation.rxFrom[txStation.key].reports, [rr1, rr2], 'rxFrom')
      })
      // add same reports again
      txStation.addTxTo(rxStation, rr1)
      rxStation.addRxFrom(txStation, rr1)
      txStation.addTxTo(rxStation, rr2)
      rxStation.addRxFrom(txStation, rr2)
      it('does not add duplicate reports to txTo/rxFrom', function () {
        assert.deepEqual(txStation.txTo[rxStation.key].reports, [rr1, rr2], 'txTo reports')
        assert.deepEqual(rxStation.rxFrom[txStation.key].reports, [rr1, rr2], 'rxFrom')
      })
    })

    describe('station getAllReports()', function () {
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
      let txStation = new Station('AA2AC', 'DM79', '7')
      let rxStation = new Station('AA1AA', 'EN61', '7')
      txStation.addTxTo(rxStation, rr1)
      rxStation.addRxFrom(txStation, rr1)
      txStation.addTxTo(rxStation, rr2)
      rxStation.addRxFrom(txStation, rr2)
      it('retrieves the reports that were added', function () {
        assert.deepEqual(txStation.getAllReports(), [rr1, rr2], 'txTo station')
        assert.deepEqual(rxStation.getAllReports(), [rr1, rr2], 'rxTo station')
      })
    })

    describe('station removeReports()', function () {
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
      it('adds reports and removes them  individually', function () {
        let txStation = new Station('AA2AC', 'DM79', '7')
        let rxStation = new Station('AA1AA', 'EN61', '7')
        txStation.addTxTo(rxStation, rr1)
        txStation.addTxTo(rxStation, rr2)
        assert.deepEqual(txStation.getAllReports(), [rr1, rr2], 'all added reports')
        txStation.removeReports(function (rr) { return rr.timestamp === rr1.timestamp })
        assert.deepEqual(txStation.getAllReports(), [rr2], 'rr1 removed')
        txStation.removeReports(function (rr) { return rr.timestamp === rr2.timestamp })
        assert.deepEqual(txStation.getAllReports(), [], 'rr2 removed')
      })
      it('adds reports and removes them all at once', function () {
        let txStation = new Station('AA2AC', 'DM79', '7')
        let rxStation = new Station('AA1AA', 'EN61', '7')
        txStation.addTxTo(rxStation, rr1)
        txStation.addTxTo(rxStation, rr2)
        assert.deepEqual(txStation.getAllReports(), [rr1, rr2], 'all added reports')
        txStation.removeReports(function () { return true })
        assert.deepEqual(txStation.getAllReports(), [], 'rr2 removed')
      })
    })
  })

  describe('Station class methods', function () {
    describe('Station.generateStationKey()', function () {
      describe('basic usage', function () {
        let allTestData = [
          {call: 'N0JUH', grid: 'FM19', band: '7', key: '|N0JUH|FM19|7|', comment: 'standard inputs'},
          {call: 'n0juh', grid: 'fm19', band: '7', key: '|N0JUH|FM19|7|', comment: 'lower-case inputs'}
        ]
        it ('generates station key', function () {
          _forEach(allTestData, function (testData) {
            let stationKey =  Station.generateStationKey(testData.call, testData.grid, testData.band)
            assert.equal(stationKey, testData.key, JSON.stringify([stationKey, testData], null, 2))
          })
        })
      })

      describe('grdKeyLength paameter', function () {
        let testStation = {call: 'N0JUH', grid: 'FM19qg54', band: '7'}
        it ('does not change grid if gridKeyLength parameter is not given', function () {
          let stationKey =  Station.generateStationKey(testStation.call, testStation.grid, testStation.band)
          assert.equal(stationKey, '|N0JUH|FM19QG54|7|', 'computed: ' + stationKey)
        })
        it ('does not change grid if gridKeyLength parameter is null', function () {
          let stationKey =  Station.generateStationKey(testStation.call, testStation.grid, testStation.band, null)
          assert.equal(stationKey, '|N0JUH|FM19QG54|7|', 'computed: ' + stationKey)
        })
        it ('does not change grid if gridKeyLength parameter > length of grid value', function () {
          let stationKey =  Station.generateStationKey(testStation.call, testStation.grid, testStation.band, 10)
          assert.equal(stationKey, '|N0JUH|FM19QG54|7|', 'computed: ' + stationKey)
        })
        it ('does not change grid if gridKeyLength parameter == length of grid value', function () {
          let stationKey =  Station.generateStationKey(testStation.call, testStation.grid, testStation.band, 8)
          assert.equal(stationKey, '|N0JUH|FM19QG54|7|', 'computed: ' + stationKey)
        })
        it ('does truncates grid if gridKeyLength parameter < length of grid value', function () {
          let stationKey =  Station.generateStationKey(testStation.call, testStation.grid, testStation.band, 4)
          assert.equal(stationKey, '|N0JUH|FM19|7|', 'computed: ' + stationKey)
        })
      })
    })

    describe('Station.maidenheadForGrid()', function () {
      it ('returns null for no grid', function () {
        assert.isNull(Station.maidenheadForGrid(), 'no grid given')
        assert.isNull(Station.maidenheadForGrid(null), 'null grid')
        assert.isNull(Station.maidenheadForGrid(''), 'empty grid')
      })

      it ('returns null for bad grid', function () {
        assert.isNull(Station.maidenheadForGrid('xyz'), 'invalid grid string')
        assert.isNull(Station.maidenheadForGrid({abc: 123}), 'grid not a string')
      })

      it ('generates maidenhead precision 1', function () {
        let maidenhead = Station.maidenheadForGrid('fm')
        assert.equal(maidenhead.locator, 'FM', 'locator')
        assert.equal(maidenhead.lat, 35.4811, 'latitude')
        assert.equal(maidenhead.lon, -69.0378, 'longitude')
      })

      it ('generates maidenhead precision 2', function () {
        let maidenhead = Station.maidenheadForGrid('fm19')
        assert.equal(maidenhead.locator, 'FM19', 'locator')
        assert.equal(maidenhead.lat, 39.4811, 'latitude')
        assert.equal(maidenhead.lon, -77.0378, 'longitude')
      })

      it ('generates maidenhead precision 3', function () {
        let maidenhead = Station.maidenheadForGrid('fm19qg')
        assert.equal(maidenhead.locator, 'FM19qg', 'locator')
        assert.equal(maidenhead.lat, 39.2727, 'latitude')
        assert.equal(maidenhead.lon, -76.6212, 'longitude')
      })

      it ('generates maidenhead precision 4', function () {
        let maidenhead = Station.maidenheadForGrid('fm19qg57')
        assert.equal(maidenhead.locator, 'FM19qg57', 'locator')
        assert.equal(maidenhead.lat, 39.2811, 'latitude')
        assert.equal(maidenhead.lon, -76.6212, 'longitude')
      })

      it ('generates maidenhead precision 5', function () {
        let maidenhead = Station.maidenheadForGrid('fm19qg57xf')
        // it looks like it doesent handle this precision completely
        assert.equal(maidenhead.locator, 'FM19qg57xe', 'locator')
        assert.equal(maidenhead.lat, 39.2800, 'latitude')
        assert.equal(maidenhead.lon, -76.6170, 'longitude')
      })
    })
  })
})
