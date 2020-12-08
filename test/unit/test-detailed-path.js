/* @js8path/js8path route
mocha tests for DetailedPath class
test-detailed-path.js
*/

/* global describe, it */
// import _cloneDeep from 'lodash/cloneDeep'

import js8pathRoute from '../../src/main.js'

let Station = js8pathRoute.Station
let LinkedStation = js8pathRoute.LinkedStation
let DetailedPath = js8pathRoute.DetailedPath

let chai = require('chai')
let assert = chai.assert

describe('js8path-route DetailedPath class', function () {
  let station0 = new Station('A1B', 'DL82', 7)
  let station1 =  new Station('A2C', 'EN22', 7)
  let station2 =  new Station('A3B', 'FM19', 7)

  describe('new DetailedPath()', function () {
    describe ('three stations', function () {
      let detailedPath = new DetailedPath([ station0, station1, station2])
      it ('isDetailedPath', function () {
        assert.isOk(detailedPath.isDetailedPath)
      })
      it ('simplePath', function () {
        assert.isOk(detailedPath.simplePath[0].sameStationAs(station0), 'station0')
        assert.isOk(detailedPath.simplePath[1].sameStationAs(station1), 'station1')
        assert.isOk(detailedPath.simplePath[2].sameStationAs(station2), 'station2')
      })
      describe ('linkedStations', function () {
        it ('station0', function () {
          assert.isOk(detailedPath.linkedStations[0].isLinkedStation, 'is linked')
          assert.isOk(detailedPath.linkedStations[0].sameStationAs(station0), 'same as given')
          assert.isNotObject(detailedPath.linkedStations[0].prevStation, 'prevStation')
          assert.isOk(detailedPath.linkedStations[0].nextStation.sameStationAs(station1), 'nextStation')
        })
        it ('station1', function () {
          assert.isOk(detailedPath.linkedStations[1].isLinkedStation, 'is linked')
          assert.isOk(detailedPath.linkedStations[1].sameStationAs(station1), 'same as given')
          assert.isOk(detailedPath.linkedStations[1].prevStation.sameStationAs(station0), 'prevStation')
          assert.isOk(detailedPath.linkedStations[1].nextStation.sameStationAs(station2), 'nextStation')
        })
        it ('station2', function () {
          assert.isOk(detailedPath.linkedStations[2].isLinkedStation, 'is linked')
          assert.isOk(detailedPath.linkedStations[2].sameStationAs(station2), 'same as given')
          assert.isOk(detailedPath.linkedStations[2].prevStation.sameStationAs(station1), 'prevStation')
          assert.isNotObject(detailedPath.linkedStations[2].nextStation, 'nextStation')
        })
      })
      it ('stationCount', function () {
        assert.equal(detailedPath.stationCount, 3)
      })
      it ('totalDistance', function () {
        assert.equal(
          detailedPath.totalDistance,
          detailedPath.linkedStations[1].distanceToPrev + detailedPath.linkedStations[1].distanceToNext
        )
      })
      it ('key', function () {
        assert.equal(
          detailedPath.key,
          '|A1B|DL82|7|,|A2C|EN22|7|,|A3B|FM19|7|'
        )
      })
    })
  })
})
