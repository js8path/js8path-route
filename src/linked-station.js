/*
    LinkedStation - Wrapper for a Station object that is in a path with preceding and following stations
    linked-station.js
*/
import _get from 'lodash/get'
// import Station from './station.js'

class LinkedStation {
  constructor (station, prevStation = null, nextStation = null) {
    LinkedStation.initializeStation(this, station, prevStation, nextStation)
  }
  get call () {
    return this.station.call
  }
  get grid () {
    return this.station.grid
  }
  get band () {
    return this.station.band
  }
  get key () {
    return this.station.key
  }
  get maidenhead () {
    return this.station.maidenhead
  }
  get txTo () {
    return this.station.txTo
  }
  get rxFrom () {
    return this.station.rxFrom
  }
  sameStationAs (otherStation) {
    let thisStation = this
    return thisStation.key === otherStation.key
  }
  refresh () {
    LinkedStation.initializeStation(this, this.station, this.prevStation, this.nextStation)
  }
  reinitialize (station, prevStation = null, nextStation = null) {
    LinkedStation.initializeStation(this, station, prevStation, nextStation)
  }
}

LinkedStation.initializeStation = function (aLinkedStation, station, prevStation = null, nextStation = null) {
  // (re-)initialize a LinkedStation object
  aLinkedStation.isLinkedStation = true
  aLinkedStation.station = station
  aLinkedStation.prevStation = prevStation
  aLinkedStation.nextStation = nextStation
  aLinkedStation.distanceToPrev = null
  aLinkedStation.bearingToPrev = null
  aLinkedStation.bearingFromPrev = null
  aLinkedStation.distanceToNext = null
  aLinkedStation.bearingToNext = null
  aLinkedStation.bearingFromNext = null
  if (station.maidenhead) {
    if (prevStation && prevStation.maidenhead) {
      aLinkedStation.distanceToPrev = station.maidenhead.distanceTo(prevStation.maidenhead)
      aLinkedStation.bearingToPrev = station.maidenhead.bearingTo(prevStation.maidenhead)
      aLinkedStation.bearingFromPrev = prevStation.maidenhead.bearingTo(station.maidenhead)
    }
    if (nextStation && nextStation.maidenhead) {
      aLinkedStation.distanceToNext = station.maidenhead.distanceTo(nextStation.maidenhead)
      aLinkedStation.bearingToNext = station.maidenhead.bearingTo(nextStation.maidenhead)
      aLinkedStation.bearingFromNext = nextStation.maidenhead.bearingTo(station.maidenhead)
    }
  }
  if (prevStation) {
    aLinkedStation.reportsToPrev = _get(station.txTo, [prevStation.key, 'reports'], [])
    aLinkedStation.reportsFromPrev = _get(station.rxFrom, [prevStation.key, 'reports'], [])
  } else {
    aLinkedStation.reportsToPrev = []
    aLinkedStation.reportsFromPrev = []
  }
  if (nextStation) {
    aLinkedStation.reportsToNext = _get(station.txTo, [nextStation.key, 'reports'], [])
    aLinkedStation.reportsFromNext = _get(station.rxFrom, [nextStation.key, 'reports'], [])
  } else {
    aLinkedStation.reportsToNext = []
    aLinkedStation.reportsFromNext = []
  }
}

export default LinkedStation
