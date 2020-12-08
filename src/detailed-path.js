/*
    DetailedPath - Wrapper for a path with additional computed values
    detailed-path.js
*/
import _isNull from 'lodash/isNull'
import _join from 'lodash/join'
import _map from 'lodash/map'
import _reduce from 'lodash/reduce'

import js8pathRoute from './main'

class DetailedPath {
  constructor(simplePath = []) {
    let linkedStations = DetailedPath.linkedStationsForSimplePath(simplePath)
    this.isDetailedPath = true
    this.simplePath = simplePath
    this.linkedStations = linkedStations
    this.stationCount = linkedStations.length
    this.totalDistance = DetailedPath.computeTotalPathDistance(linkedStations)
    this.key = _join(_map(simplePath, (station) => { return station.key }))
  }
}

DetailedPath.linkedStationsForSimplePath = function (simplePath = []) {
  // compute the linked stations for a simple path
  return _map(simplePath, (station, stationIx) => {
    let prevStation = null
    let nextStation = null
    if (stationIx > 0) {
      prevStation = simplePath[stationIx - 1]
    }
    if (stationIx < simplePath.length - 1) {
      nextStation = simplePath[stationIx + 1]
    }
    return new js8pathRoute.LinkedStation(station, prevStation, nextStation)
  })
}

DetailedPath.computeTotalPathDistance = function (linkedStations = []) {
  // compute the sum uf the distance between stations
  return  _reduce(
    linkedStations,
    (sum, linkedStation) => {
      let distanceToNext = 0
      if (!_isNull(linkedStation.nextStation)) {
        distanceToNext =  linkedStation.distanceToNext
      }
      return sum + distanceToNext
    },
    0
  )
}

export default DetailedPath
