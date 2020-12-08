/* Js8path router instance methods
mocha tests for router
test-router-instance-methods.js
*/

/* global describe, it */
// import _cloneDeep from 'lodash/cloneDeep'

import js8pathData from '@js8path/js8path-data'
import js8pathRoute from '../../src/main.js'
import _has from 'lodash/has'
import _isEqual  from 'lodash/isEqual'
import _isNull  from 'lodash/isNull'

let Router = js8pathRoute.Router
let Station = js8pathRoute.Station

let chai = require('chai')
let assert = chai.assert

describe('js8path-route Router instance methods', function () {
  describe('router.lookupAddStation()', function () {
    let station = new Station('N0JUH', 'FM19', '7')
    let dupStation = new Station('N0JUH', 'FM19', '7')

    it('initially does not contain station', function () {
      let router = new Router()
      assert.isNotOk(_has(router.stations, station.key))
    })

    it('contains station after add', function () {
      let router = new Router()
      router.lookupAddStation(station)
      assert.isOk(_has(router.stations, station.key))
    })

    it('can lookup station after add', function () {
      let router = new Router()
      router.lookupAddStation(station)
      assert.equal(router.lookupAddStation(station), station, 'identity for added station')
      assert.deepEqual(router.lookupAddStation(station), station, 'deepEqual for added station')
      assert.notEqual(router.lookupAddStation(dupStation), dupStation, 'non-identity for duplcate station')
      assert.equal(router.lookupAddStation(dupStation), station, 'dup station lookup returns added station')
    })
  })

  describe('load reception reports into router', function () {
    let rr1 = {
      "timestamp": "2019-04-27T00:22:15Z",
      "freqHz": 7078574,
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    js8pathData.utilities.computeReceptionReportKey(rr1, {bandInfoTable: []})
    let rr2 = {
      "timestamp": "2019-04-27T00:22:30Z",
      "freqHz": 7078574,
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    js8pathData.utilities.computeReceptionReportKey(rr2, {bandInfoTable: []})
    let txStation = new Station('AA2AC', 'DM79', rr2.band)
    let rxStation = new Station('AA1AA', 'EN61', rr2.band)

    it('loads reception reports individually with router.loadReport()', function () {
      let router = new Router()
      return router.loadReport(rr1).then(function (success) {
        assert.isOk(success, 'success')
        assert.isOk(txStation.sameStationAs(router.stations[txStation.key]), 'txStation stored')
        assert.isOk(rxStation.sameStationAs(router.stations[rxStation.key]), 'rxStation stored')
        assert.isOk(rxStation.sameStationAs(router.stations[txStation.key].txTo[rxStation.key].station), 'rxStation stored in txTo')
        assert.isOk(txStation.sameStationAs(router.stations[rxStation.key].rxFrom[txStation.key].station), 'txStation stored in rxFrom')
        assert.deepEqual(router.stations[txStation.key].txTo[rxStation.key].reports, [rr1], 'rr1 stored in txTo')
        assert.deepEqual(router.stations[rxStation.key].rxFrom[txStation.key].reports, [rr1], 'rr1 stored in rxFrom')
        assert.deepEqual(router.oldestReport, rr1, JSON.stringify(['rr1 is oldest report', router.oldestReport, rr1], null, 2))
        assert.deepEqual(router.latestReport, rr1, JSON.stringify(['rr1 is latest report', router.latestReport, rr1], null, 2))
        return router.loadReport(rr2) // load another
      }).then(function (success) {
        assert.isOk(success, 'success')
        let txToReports = router.stations[txStation.key].txTo[rxStation.key].reports
        assert.deepEqual(txToReports, [rr1, rr2], JSON.stringify(['rr1, rr2 stored in txTo', txToReports, [rr1, rr2]], null, 2))
        assert.deepEqual(router.stations[rxStation.key].rxFrom[txStation.key].reports, [rr1, rr2], 'rr1, rr2 stored in rxFrom')
        assert.deepEqual(router.oldestReport, rr1, JSON.stringify(['rr1 is oldest report', router.oldestReport, rr1], null, 2))
        assert.deepEqual(router.latestReport, rr2, JSON.stringify(['rr2 is latest report', router.latestReport, rr2], null, 2))
        return router.loadReport('xyz') // bad
      }).then(function (success) {
        assert.isNotOk(success, 'success')
      })
    })

    it('loads reception reports list with router.loadReports()', function () {
      let router = new Router()
      return router.loadReports([rr1, rr2, 'xyz']).then(function (loadedCount) {
        assert.equal(loadedCount, 2, 'loadedCount')
        assert.isOk(txStation.sameStationAs(router.stations[txStation.key]), 'txStation stored')
        assert.isOk(rxStation.sameStationAs(router.stations[rxStation.key]), 'rxStation stored')
        assert.isOk(rxStation.sameStationAs(router.stations[txStation.key].txTo[rxStation.key].station), 'rxStation stored in txTo')
        assert.isOk(txStation.sameStationAs(router.stations[rxStation.key].rxFrom[txStation.key].station), 'txStation stored in rxFrom')
        assert.deepEqual(router.stations[txStation.key].txTo[rxStation.key].reports, [rr1, rr2], 'rr1, rr2 stored in txTo')
        assert.deepEqual(router.stations[rxStation.key].rxFrom[txStation.key].reports, [rr1, rr2], 'rr1, rr2 stored in rxFrom')
        // try loading the same reports again
        return router.loadReports([rr1, rr2, 'xyz'])
      }).then(function (loadedCount) {
        // shows that 2 reports were loaded
        assert.equal(loadedCount, 2, 'loadedCount')
        // but routed report are unchanged, because duplicates were ignored
        assert.deepEqual(router.stations[txStation.key].txTo[rxStation.key].reports, [rr1, rr2], 'rr1, rr2 stored in txTo')
        assert.deepEqual(router.stations[rxStation.key].rxFrom[txStation.key].reports, [rr1, rr2], 'rr1, rr2 stored in rxFrom')
      })
    })

    it('gets stations with stationList()', function () {
      let router = new Router()
      assert.equal(router.stationList().length, 0, 'new router stationList().length')
      return router.loadReports([rr1, rr2]).then(function (loadedCount) {
        assert.equal(loadedCount, 2, 'loadedCount')
        let stationList = router.stationList()
        assert.equal(stationList.length, 2, 'new router stationList().length')
        assert.isOk(txStation.sameStationAs(stationList[0]) || txStation.sameStationAs(stationList[1]), 'txStation in stationList()')
        assert.isOk(rxStation.sameStationAs(stationList[0]) || rxStation.sameStationAs(stationList[1]), 'rxStation in stationList()')
      })
    })

    it('gets loaded reports with router.getAllReports()', function () {
      let router = new Router()
      return router.loadReports([rr1, rr2]).then(function (loadedCount) {
        assert.equal(loadedCount, 2, 'loadedCount')
        assert.deepEqual(router.getAllReports(), [rr1, rr2], 'getAllReports()')
      })
    })

    it('removes loaded reports with router.removeReports()', function () {
      let router = new Router()
      return router.loadReports([rr1, rr2]).then(function (loadedCount) {
        assert.equal(loadedCount, 2, 'loadedCount')
        assert.deepEqual(router.getAllReports(), [rr1, rr2], 'getAllReports() with rr1 and rr2')
        assert.deepEqual(router.oldestReport, rr1, 'oldest report with rr1 and rr2')
        assert.deepEqual(router.latestReport, rr2, 'latest report with rr1 and rr2')
        return router.removeReports(function (rr) { return _isEqual(rr, rr1) })
      }).then(function() {
        assert.deepEqual(router.getAllReports(), [rr2], 'getAllReports() with rr1 removed')
        assert.deepEqual(router.oldestReport, rr2, 'oldest report with rr1 removed')
        assert.deepEqual(router.latestReport, rr2, 'latest report with rr1 removed')
        return router.removeReports(function (rr) { return _isEqual(rr, rr2) })
      }).then(function() {
        assert.deepEqual(router.getAllReports(), [], 'getAllReports() with rr2 removed')
        assert.isOk(_isNull(router.oldestReport), 'oldest report with rr2 removed')
        assert.isOk(_isNull(router.latestReport), 'latest report with rr2 removed')
      })
    })

    it('removes all loaded reports with router.clearReports()', function () {
      let router = new Router()
      return router.loadReports([rr1, rr2]).then(function (loadedCount) {
        assert.equal(loadedCount, 2, 'loadedCount')
        assert.deepEqual(router.getAllReports(), [rr1, rr2], 'getAllReports() with rr1 and rr2')
        assert.deepEqual(router.oldestReport, rr1, 'oldest report with rr1 and rr2')
        assert.deepEqual(router.latestReport, rr2, 'latest report with rr1 and rr2')
        return router.clearReports()
      }).then(function() {
        assert.deepEqual(router.getAllReports(), [], 'getAllReports() after clearReports()')
        assert.isOk(_isNull(router.oldestReport), 'oldest report after clearReports()')
        assert.isOk(_isNull(router.latestReport), 'latest report after clearReports()')
      })
    })
  })

  describe('load duplicate station reception reports into router', function () {
    let rr1 = {
      "timestamp": "2019-04-27T00:22:15Z",
      "freqHz": 7078574,
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    js8pathData.utilities.computeReceptionReportKey(rr1, {bandInfoTable: []})
    let rr2 = {
      "timestamp": "2019-04-27T00:22:30Z",
      "freqHz": 7078574,
      "sNR": -6,
      "rxCall": "AA1AA",
      "rxGrid": "EN61ab",
      "txCall": "AA2AC",
      "txGrid": "DM79"
    }
    js8pathData.utilities.computeReceptionReportKey(rr2, {bandInfoTable: []})

    it('loads separate stations if grids are smaller than gridKeyLength', function () {
      let router = new Router({ gridKeyLength: 6 })
      return router.loadReports([rr1, rr2]).then(function () {
        assert.isOk(_has(router.stations, '|AA1AA|EN61|??|'), 'low precision grid')
        assert.isOk(_has(router.stations, '|AA1AA|EN61AB|??|'), 'high precision grid')
      }).then(function (success) {
        assert.isNotOk(success, 'success')
      })
    })

    it('combines stations if grids are truncated by than gridKeyLength', function () {
      let router = new Router({ gridKeyLength: 4 })
      return router.loadReports([rr1, rr2]).then(function () {
        assert.isOk(_has(router.stations, '|AA1AA|EN61|??|'), 'low precision grid')
        assert.isOk(!_has(router.stations, '|AA1AA|EN61AB|??|'), 'high precision grid')
        assert.equal(router.stations['|AA1AA|EN61|??|'].grid, 'EN61ab', 'maintains high precision grid value')
      }).then(function (success) {
        assert.isNotOk(success, 'success')
      })
    })
  })

  describe('_updateOldestLatestReports', function () {
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

    it('computes oldest and latest reports', function () {
      let router = new Router()
      assert.isOk(_isNull(router.oldestReport), 'initial oldest report')
      assert.isOk(_isNull(router.latestReport), 'initial latest report')
      router._updateOldestLatestReports([rr1, rr2])
      assert.deepEqual(router.oldestReport, rr1, 'oldest report is  rr1')
      assert.deepEqual(router.latestReport, rr2, 'latest  report is rr2')
    })
  })

  describe('router.clearReports()', function () {
    // FixMe: reimplement this
    /*
    it('loads receptionReports', function () {
      let router = new Router()
      return router.loadReports(rrTest1).then(function (router) {
        assert.isOk(router.receptionReports.length > 0, 'reporte loaded')
        return router.clearReports()
      }).then(function (router) {
        assert.deepEqual(router.receptionReports, [])
        assert.deepEqual(router.rxBy, {})
        assert.deepEqual(router.txBy, {})
      })
    })
     */
  })
})
