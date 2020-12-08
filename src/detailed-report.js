/*
    DetailedReport - Wrapper object for a Report data with computed details
    detailed-report.js
    FixMe: needs tests
*/
import _clamp from 'lodash/clamp'
import _cloneDeep from 'lodash/cloneDeep'
import _isNull from 'lodash/isNull'
import _merge from 'lodash/merge'

import moment from 'moment'

import LinkedStation from './linked-station.js'
import Router from './router.js'
import Station from './station.js'

let reportOptsDefault = {
  gridKeyLength: Station.stationOptsDefault.gridKeyLength,
  reliabilityOpts: {
    referenceMoment: null,
    computationFn: null,
    computationParams: {
      sNR_min: -30,
      sNR_max: 10,
      ageSecondsMax: 3600
    }
  }
}

class DetailedReport {
  constructor (rawReport, opts = {}) {
    DetailedReport.initializeReport(this, rawReport, opts)
  }
  get key () {
    return this.rawReport._key
  }
  get timestamp () {
    return this.rawReport.timestamp
  }
  get freqHz () {
    return this.rawReport.freqHz
  }
  get band () {
    return this.rawReport.band
  }
  get sNR () {
    return this.rawReport.sNR
  }
  get rxCall () {
    return this.rawReport.rxCall
  }
  get rxGrid () {
    return this.rawReport.rxGrid
  }
  get txCall () {
    return this.rawReport.txCall
  }
  get txGrid () {
    return this.rawReport.txGrid
  }
  sameStationsAs (otherReport) {
    // true if tx and rx stations are the same
    let thisReport = this
    return thisReport.txStationKey === otherReport.txStationKey && thisReport.rxStationKey === otherReport.rxStationKey
  }
  sameEndpointsAs (otherReport) {
    // true if tx and rx stations are the same in either direction
    let thisReport = this
    let sameEndpointsAs = false
    if (thisReport.txStationKey === otherReport.txStationKey && thisReport.rxStationKey === otherReport.rxStationKey) {
      sameEndpointsAs = true
    } else if (thisReport.txStationKey === otherReport.rxStationKey && thisReport.rxStationKey === otherReport.txStationKey) {
      sameEndpointsAs = true
    }
    return sameEndpointsAs
  }
  computeReliability (opts = {}) {
    let thisReport = this
    opts =  _merge({}, this.opts.reliabilityOpts, opts)
    let computationFn = _isNull(opts.computationFn) ? DetailedReport.reliabilityComputationFn : opts.computationFn
    thisReport.reliability = computationFn(thisReport, opts.referenceMoment, opts.computationParams)
  }
  refresh (opts = {}) {
    opts =  _merge({}, this._optsOverrides, opts)
    DetailedReport.initializeStation(this, opts)
  }
  reinitialize (rawReport, opts = {}) {
    DetailedReport.initializeStation(this, rawReport, opts)
  }
}

DetailedReport.initializeReport = function (aDetailedReport, rawReport, opts = {}) {
  // (re-)initialize a DetailedReport object
  aDetailedReport.isDetailedReport = true
  rawReport = Router.processReport(rawReport)
  aDetailedReport.rawReport = rawReport
  aDetailedReport._optsOverrides =  _cloneDeep(opts)
  opts =  _merge({}, reportOptsDefault, opts)
  aDetailedReport.opts = opts
  let rxStation = new Station(rawReport.rxCall, rawReport.rxGrid, rawReport.band, {gridKeyLength: opts.gridKeyLength})
  aDetailedReport.rxStationKey = rxStation.key
  aDetailedReport.rxMaidenhead = rxStation.maidenhead
  let txStation = new Station(rawReport.txCall, rawReport.txGrid, rawReport.band, {gridKeyLength: opts.gridKeyLength})
  aDetailedReport.txStationKey = txStation.key
  aDetailedReport.txMaidenhead = txStation.maidenhead
  let txLinkedStation = new LinkedStation(txStation, rxStation)
  aDetailedReport.txBearing = txLinkedStation.bearingToPrev
  aDetailedReport.rxBearing = txLinkedStation.bearingFromPrev
  aDetailedReport.distance = txLinkedStation.distanceToPrev
  aDetailedReport.computeReliability()
}

DetailedReport.reliabilityComputationFn = function (aDetailedReport, referenceMoment, params) {
  // compute reliability factor for a DetailedReport
  params = _merge({}, aDetailedReport.opts.reliabilityOpts.computationParams, params)
  if (_isNull(referenceMoment)) {
    referenceMoment = moment()
  }
  let sNR_range = params.sNR_max - params.sNR_min
  let sNR_factor = _clamp(_clamp(aDetailedReport.sNR - params.sNR_min, 0, sNR_range) / sNR_range,0,1)
  let ageSeconds = _clamp(referenceMoment.unix() -  moment(aDetailedReport.timestamp).unix(), 0, params.ageSecondsMax)
  let ageFactor = _clamp((params.ageSecondsMax - ageSeconds) / params.ageSecondsMax, 0, 1)
  let reliability = sNR_factor * ageFactor
  return _clamp(reliability, 0, 1)
}

export default DetailedReport
