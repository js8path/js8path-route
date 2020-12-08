/*
    station - station object
    station.js
*/

import _assign from "lodash/assign"
import _concat from "lodash/concat"
import _forEach from 'lodash/forEach'
import _get from 'lodash/get'
import _groupBy from 'lodash/groupBy'
import _has from 'lodash/has'
import _intersectionBy from 'lodash/intersectionBy'
import _isNull  from 'lodash/isNull'
import _join from 'lodash/join'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _remove from 'lodash/remove'
import _times from 'lodash/times'
import _toUpper from 'lodash/toUpper'
import _values from 'lodash/values'

import Maidenhead from 'maidenhead'

import utils from './utils.js'
import _size from 'lodash/size'
import _intersection from 'lodash/intersection'

let stationOptsDefault = {
  gridKeyLength: 6
}

class Station {
  constructor (call, grid, band, opts = {}) {
    call = call || ''
    grid = grid || ''
    band = band || ''
    this.call = call
    this.grid = grid
    this.band = band
    this.opts = _assign({}, stationOptsDefault, opts)
    this.key = Station.generateStationKey(call, grid, band, this.opts.gridKeyLength)
    this.maidenhead = Station.maidenheadForGrid(grid)
    this.txTo = {}
    this.rxFrom = {}
    this.isLinkedStation = false
  }

  stationData () {
    // answer serializable data for the station only
    let thisStation = this
    return {
      call: thisStation.call,
      grid: thisStation.grid,
      band: thisStation.band,
      key: thisStation.key
    }
  }

  linkInfo () {
    // answer some info about the stations that this station can communicate with
    let thisStation = this
    let canTxTo = _map(thisStation.txTo, function (txToLink) {
      return txToLink.station.stationData()
    })
    let canRxFrom = _map(thisStation.rxFrom, function (rxFromLink) {
      return rxFromLink.station.stationData()
    })
    let canQsoWith = _intersectionBy(canTxTo, canRxFrom, 'key')
    return {
      station: thisStation.stationData(),
      canTxTo: canTxTo,
      canRxFrom: canRxFrom,
      canQsoWith: canQsoWith
    }
  }

  sameStationAs (otherStation) {
    let thisStation = this
    return thisStation.key === otherStation.key
  }

  addTxTo (station, report) {
    let thisStation = this
    if (!_has(thisStation.txTo, station.key)) {
      thisStation.txTo[station.key] = {
        station: station,
        reports: []
      }
    }
    utils.addReportToList(thisStation.txTo[station.key].reports, report)
  }

  addRxFrom (station, report) {
    let thisStation = this
    if (!_has(thisStation.rxFrom, station.key)) {
      thisStation.rxFrom[station.key] = {
        station: station,
        reports: []
      }
    }
    utils.addReportToList(thisStation.rxFrom[station.key].reports, report)
  }

  getTxToReports () {
    // answer list of unique reception reports where this station is transmitting
    let thisStation = this
    let receptionReports = []
    _forEach(thisStation.txTo,function (stationReportCollection) {
      receptionReports = _concat(receptionReports, stationReportCollection.reports)
    })
    // receptionReports = utils.deduplicateReportList(receptionReports)
    return receptionReports
  }

  getRxFromReports () {
    // answer list of unique reception reports where this station is receiving
    let thisStation = this
    let receptionReports = []
    _forEach(thisStation.rxFrom,function (stationReportCollection) {
      receptionReports = _concat(receptionReports, stationReportCollection.reports)
    })
    // receptionReports = utils.deduplicateReportList(receptionReports)
    return receptionReports
  }

  getAllReports () {
    // answer list of unique reception reports registered with the station
    let thisStation = this
    return  _concat(thisStation.getTxToReports(), thisStation.getRxFromReports())
    // return utils.deduplicateReportList(receptionReports)
  }

  getReportStats () {
    // answer some stats about the stations reports
    // FixMe: needs tests
    let thisStation = this
    let rxtxKeys = _intersection(_keys(thisStation.txTo),  _keys(thisStation.rxFrom))
    let stats = {
      txToStationCount: _size(thisStation.txTo),
      rxFromStationCount: _size(thisStation.rxFrom),
      twoWayStationCount: _size(rxtxKeys),
      rxTxLatestReport: null,
      rxFromLatestReport: null,
      txToLatestReport: null
    }
    _forEach(thisStation.getRxFromReports(), (rr) => {
      if (rr.timestamp > _get(stats, ['rxTxLatestReport', 'timestamp'], '')) {
        stats.rxTxLatestReport = rr
      }
      if (rr.timestamp > _get(stats, ['rxFromLatestReport', 'timestamp'], '')) {
        stats.rxFromLatestReport = rr
      }
    })
    _forEach(thisStation.getTxToReports(), (rr) => {
      if (rr.timestamp > _get(stats, ['rxTxLatestReport', 'timestamp'], '')) {
        stats.rxTxLatestReport = rr
      }
      if (rr.timestamp > _get(stats, ['txToLatestReport', 'timestamp'], '')) {
        stats.txToLatestReport = rr
      }
    })
    return  stats
  }

  removeReports (removalPredicate) {
    // remove all reports where removalPredicate is true
    let thisStation = this
    _forEach([thisStation.txTo, thisStation.rxFrom], function (reportCollection) {
      let stationKeys = _keys(reportCollection)
      _forEach(stationKeys,function (stationKey) {
        let stationReportCollection = reportCollection[stationKey]
        _remove(stationReportCollection.reports, removalPredicate)
        if (stationReportCollection.reports.length === 0) {
          delete reportCollection[stationKey]
        }
      })
    })
  }

  getSimplePaths (maxLength = 2, outgoing= true) {
    // answer all simple paths up to specified length in given direction
    // FixMe: needs full tests (basic test is in test-station-paths)
    let thisStation = this
    let paths = []
    let doneStationKeys = new Set()
    _times(maxLength-1, () => {
      let pathsToExtend = []
      if (paths.length === 0) {
        pathsToExtend.push([thisStation])
      } else {
        _forEach(paths, (existingPath) => {
          let lastStation = _last(existingPath)
          if (!doneStationKeys.has(lastStation.key)) {
            pathsToExtend.push(existingPath)
          }
        })
      }
      _forEach(pathsToExtend, (pathToExtend) => {
        let lastStation = _last(pathToExtend)
        var nextStations
        if (outgoing) {
          nextStations = lastStation.txTo
        } else {
          nextStations = lastStation.rxFrom
        }
        _forEach(nextStations, (nextStationData) =>{
          let newPath = _concat(pathToExtend, [nextStationData.station])
          paths.push(newPath)
        })
      })
      _forEach(pathsToExtend, (pathToExtend) => {
        let lastStation = _last(pathToExtend)
        doneStationKeys.add(lastStation.key)
      })
    })
    return paths
  }

  getAllSimplePaths (maxLength = 2) {
    // answer all simple paths up to specified length in given direction
    // FixMe: needs full tests (basic test is in test-station-paths)
    let thisStation = this
    //console.time('getAllSimplePaths')
    //console.time('getAllSimplePaths1')
    let outgoingPaths = thisStation.getSimplePaths(maxLength, true)
    //console.timeEnd('getAllSimplePaths1')
    //console.time('getAllSimplePaths2')
    let incomingPaths = thisStation.getSimplePaths(maxLength, false)
    //console.timeEnd('getAllSimplePaths2')
    //console.time('getAllSimplePaths3')
    // oringinally used lodash intersectionWith and unionWith, but this is much faster
    let allPaths = {}
    let twowayPaths = {}
    _forEach(outgoingPaths, (path) => {
      let pathKey = _join(_map(path, (station) => { return station.key }))
      allPaths[pathKey] = path
    })
    _forEach(incomingPaths, (path) => {
      let pathKey = _join(_map(path, (station) => { return station.key }))
      if (_has(allPaths, pathKey)) {
        twowayPaths[pathKey] = path
      } else {
        allPaths[pathKey] = path
      }
    })
    allPaths = _values(allPaths)
    twowayPaths = _values(twowayPaths)
    //console.timeEnd('getAllSimplePaths3')
    // let res =  {
    return  {
      outgoing: outgoingPaths,
      incoming: incomingPaths,
      all: allPaths,
      twoway: twowayPaths
    }
    //console.timeEnd('getAllSimplePaths')
    // return res
  }

  getAllSimplePathsByStation (maxLength = 2) {
    // answer all simple paths, grouped by station key, up to specified length in given direction
    // FixMe: needs full tests (basic test is in test-station-paths)
    let thisStation = this
    //console.time('getAllSimplePathsByStation')
    let allPaths = thisStation.getAllSimplePaths(maxLength)
    function lastStationGrouper (simplePath) {
      return _last(simplePath).key
    }
    //console.time('getAllSimplePathsByStation1')
    // let res = {
    return {
      outgoing: _groupBy(allPaths.outgoing, lastStationGrouper),
      incoming: _groupBy(allPaths.incoming, lastStationGrouper),
      all: _groupBy(allPaths.all, lastStationGrouper),
      twoway: _groupBy(allPaths.twoway, lastStationGrouper)
    }
    //console.timeEnd('getAllSimplePathsByStation1')
    //console.timeEnd('getAllSimplePathsByStation')
    // return res
  }
}

Station.stationOptsDefault = stationOptsDefault // exposed for testing

Station.generateStationKey = function (call, grid, band, gridKeyLength = null) {
  let gridKey = _toUpper(grid)
  if (!_isNull(gridKeyLength) && gridKey.length > gridKeyLength) {
    gridKey = gridKey.slice(0, gridKeyLength)
  }
  return `|${_toUpper(call)}|${gridKey}|${_toUpper(band)}|`
}

Station.maidenheadForGrid = function (grid) {
  let maidenhead = null
  let latlon = null
  if (grid) {
    try {
      latlon = Maidenhead.toLatLon(grid)
    } catch (err) {
      // error: bad grid
      latlon = null
    }
    if (latlon) {
      maidenhead = new Maidenhead(latlon[0], latlon[1], grid.length / 2)
    }
  }
  return maidenhead
}

export default Station
