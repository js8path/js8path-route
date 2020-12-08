/*
    route - prototype for js8path route analyzer
    route.js
*/

import _assign from "lodash/assign"
import _cloneDeep from "lodash/cloneDeep"
import _filter from "lodash/filter"
import _forEach from 'lodash/forEach'
import _has from 'lodash/has'
import _isEqual from 'lodash/isEqual'
import _isNull from 'lodash/isNull'
import _isUndefined from "lodash/isUndefined"
import _map from "lodash/map"
import _uniqWith from "lodash/uniqWith"
import _values from "lodash/values"
import js8pathData from '@js8path/js8path-data'

import utils from './utils.js'
import Station from './station'
import _concat from 'lodash/concat'

let routerOptsDefault = {
  gridKeyLength: 6
}

class Router {
  constructor (opts = {}) {
    this.opts = _assign({}, routerOptsDefault, opts)
    this.stations = {}
    this.oldestReport = null
    this.latestReport = null
  }

  loadReports (reportList) {
    let thisRouter = this
    let loadedReportCount = 0
    let p = Promise.resolve(loadedReportCount) // dummy promise to start sequential promise chain
    _forEach(reportList, function (receptionReport) {
      p = p.then(function () {
        return thisRouter.loadReport(
          receptionReport
        ).then(function (loadSucceeded) {
          if (loadSucceeded) {
            loadedReportCount++
          }
          return Promise.resolve(loadedReportCount)
          // }).catch(function (err) { return Promise.resolve(goodReports)
        })
      })
    })
    return p
  }

  loadReport (newReceptionReport) {
    let thisRouter = this
    let receptionReport = Router.processReport(newReceptionReport)
    if (!receptionReport) {
      return Promise.resolve(false)
    }
    let txStation = thisRouter.lookupAddStation(
      new Station(
        receptionReport.txCall,
        receptionReport.txGrid,
        receptionReport.band,
        { gridKeyLength: thisRouter.opts.gridKeyLength}
      )
    )
    let rxStation = thisRouter.lookupAddStation(
      new Station(
        receptionReport.rxCall,
        receptionReport.rxGrid,
        receptionReport.band,
        { gridKeyLength: thisRouter.opts.gridKeyLength}
      )
    )
    txStation.addTxTo(rxStation, receptionReport)
    rxStation.addRxFrom(txStation, receptionReport)
    thisRouter._updateOldestLatestReports ([receptionReport])
    return Promise.resolve(true)
  }

  _updateOldestLatestReports (reportsList, reset = false) {
    let thisRouter = this
    let oldestReport = reset ? null : thisRouter.oldestReport
    let latestReport = reset ? null : thisRouter.latestReport
    _forEach(reportsList, function (receptionReport) {
      if (_isNull(oldestReport) || oldestReport.timestamp > receptionReport.timestamp ) {
        oldestReport = receptionReport
      }
      if (_isNull(latestReport) || latestReport.timestamp < receptionReport.timestamp ) {
        latestReport = receptionReport
      }
    })
    thisRouter.oldestReport = oldestReport
    thisRouter.latestReport = latestReport
  }

  lookupAddStation (newStation) {
    let thisRouter = this
    if (!_has(thisRouter.stations, newStation.key)) {
      // add new station to router
      thisRouter.stations[newStation.key] = newStation
    } else if (newStation.grid.length > thisRouter.stations[newStation.key].grid.length) {
      // update existing station with more precise grid location
      thisRouter.stations[newStation.key].grid = newStation.grid
    }
    return thisRouter.stations[newStation.key]
  }

  stationList () {
    let thisRouter = this
    return _values(thisRouter.stations)
  }

  getAllReports () {
    // answer list of unique reception reports registered with router
    let thisRouter = this
    let receptionReports = []
    _forEach(thisRouter.stations, function (station) {
      receptionReports = _concat(receptionReports, station.getTxToReports())
    })
    // receptionReports = utils.deduplicateReportList(receptionReports)
    return receptionReports
  }

  removeReports (removalPredicate) {
    // remove all reports where removalPredicate is true
    let thisRouter = this
    _forEach(thisRouter.stations, function (station) {
      station.removeReports(removalPredicate)
    })
    thisRouter._updateOldestLatestReports (thisRouter.getAllReports(), true)
    return Promise.resolve(true)
  }

  clearReports() {
    let thisRouter = this
    return thisRouter.removeReports(function () { return true })
  }
}

Router.routerOptsDefault = routerOptsDefault // exposed for testing

Router.processReport = function (receptionReport) {
  // process reception report, compute missing data, eliminate extra data, return null if bad
  // FixMe: instead of this, create a DetailedReport object, and maybe move this computation there
  let rr = _cloneDeep(receptionReport)
  if (_isUndefined(rr.freqHz)) {
    rr = null
  }
  if (rr) {
    // computes .band and ._key, if missing
    js8pathData.utilities.computeReceptionReportKey(
      rr,
      {
        // force: true,
        bandInfoTable: [],
        unknownBandFunc: utils.bandFromHz
      })
    delete rr.srcData
  }
  return rr
}

Router.processReportList = function (receptionReports) {
  // process each report in given list
  let processedReports = _map(receptionReports, function(rr) {
    return Router.processReport(rr)
  })
  // remove nulls
  processedReports = _filter(processedReports, function (rr) {
    return !_isNull(rr)
  })
  // remove duplicates
  processedReports = _uniqWith(processedReports, _isEqual)
  return processedReports
}

export default Router
