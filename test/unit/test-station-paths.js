/* Js8path route
mocha tests for Station class path finding
test-station-paths.js
*/

/* global describe, it */
import _concat from 'lodash/concat'
// import _filter from 'lodash/filter'
import _forEach from 'lodash/forEach'
import _includes from 'lodash/includes'
import _keys from 'lodash/keys'
import _last from 'lodash/last'
// import _map from 'lodash/map'
import _times from 'lodash/times'

import testData from '@js8path/js8path-test-data'

import js8pathRoute from '../../src/main.js'

let receptionReportList = testData.js8pathData
// let Station = js8pathRoute.Station
let Router = js8pathRoute.Router

let chai = require('chai')
let assert = chai.assert

describe('js8path-route Station class Path finder', function () {
  let router = new Router()
  let station = null
  before(function () {
    return router.loadReports(receptionReportList).then(function () {
      let reportCount = 0
      let stationsToTest = router.stations
      // let stationsToTest = _filter(router.stations, {call: 'N0JUH'})
       _forEach(stationsToTest, function (newStation) {
        let newReportCount = newStation.getAllReports().length
        if (newReportCount > reportCount) {
          station = newStation
          reportCount = newReportCount
        }
      })
      console.log(JSON.stringify(
        { stationKey: station.key, reportCount: station.getAllReports().length },
        null,
        2
      ))
    })
  })
  describe('development2', function () {
    it('has router with expected reception reports', function () {
      let loadedCount = router.getAllReports().length
      assert.isOk(loadedCount > 100, 'loadedCount > 100')
      assert.equal(loadedCount,  receptionReportList.length, 'loadedCount === test reports length')
    })
    function getBasicPaths(station) {
      let paths = []
      _forEach(station.txTo, function (txStationData) {
        paths.push([station, txStationData.station])
      })
      return paths
    }
    function getPaths1(station, maxLength = 2) {
      let paths = getBasicPaths(station)
      let doneStationKeys = [station.key]
      _times(maxLength-2, (lengthIndex) => {
        let currLength = lengthIndex + 2
        // console.log('currLength1 ', currLength, maxLength, lengthIndex)
        let newPaths = []
        _forEach(paths, (existingPath) => {
          if (existingPath.length === currLength) {
            // console.log('  existingPath ', _map(existingPath, (station) => { return station.key }))
            let nextStation = _last(existingPath)
            if (!_includes(doneStationKeys, nextStation.key)) {
              _forEach(getBasicPaths(nextStation), (nextPath) =>{
                newPaths.push(_concat(existingPath, [_last(nextPath)]))
              })
              doneStationKeys.push(nextStation.key)
            }
          }
        })
        paths = _concat(paths, newPaths)
      })
      return paths
    }

    it('works with getPaths1()', function () {
      let paths = getPaths1(station,3)
      assert.isOk(paths.length > 0, 'pathsCount > 0')
      console.log('getPaths1().length: ', paths.length)
      /*
      _forEach(paths, (path) => {
        // console.log(path)
        console.log(JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })
       */
    })

    function getPaths2(startStation, maxLength = 2, direction = 'txTo') {
      let paths = []
      let doneStationKeys = new Set()
      _times(maxLength-1, () => {
        let pathsToExtend = []
        if (paths.length === 0) {
          pathsToExtend.push([startStation])
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
          let nextStations = []
          if (direction === 'txTo') {
            nextStations = lastStation.txTo
          } else if (direction === 'rxFrom') {
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

    it('works with getPaths2()', function () {
      let paths = getPaths2(station,3)
      assert.isOk(paths.length > 0, 'pathsCount > 0')
      console.log('getPaths2().length txTo: ', paths.length)
      paths = getPaths2(station,3, 'rxFrom')
      assert.isOk(paths.length > 0, 'pathsCount > 0')
      console.log('getPaths2().length rxFrom: ', paths.length)
      /*
      _forEach(paths, (path) => {
        console.log(JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })

       */
    })

    it('works with Station.getSimplePaths()', function () {
      let pathsTxTo = station.getSimplePaths(3, true)
      assert.isOk(pathsTxTo.length > 0, 'pathsTxTo.length > 0')
      console.log('pathsTxTo.length: ', pathsTxTo.length)
      let pathsRxFrom = station.getSimplePaths(3, false)
      assert.isOk(pathsRxFrom.length > 0, 'pathsRxFrom.length > 0')
      console.log('pathsRxFrom.length: ',pathsRxFrom.length)
    })

    it('works with Station.getAllSimplePaths()', function () {
      let allPaths = station.getAllSimplePaths(4)
      console.log('allPaths.outgoing.length: ', allPaths.outgoing.length)
      assert.isOk(allPaths.outgoing.length > 0, 'allPaths.outgoing.length > 0')
      console.log('allPaths.incoming.length: ', allPaths.incoming.length)
      assert.isOk(allPaths.incoming.length > 0, 'allPaths.incoming > 0')
      console.log('allPaths.all.length: ', allPaths.all.length)
      assert.isOk(allPaths.all.length > 0, 'allPaths.all.length > 0')
      assert.isOk(allPaths.all.length >=  allPaths.outgoing.length, 'allPaths.all.length >=  allPaths.outgoing.length')
      assert.isOk(allPaths.all.length >=  allPaths.incoming.length, 'allPaths.all.length >=  allPaths.incoming.length')
      console.log('allPaths.twoway.length: ', allPaths.twoway.length)
      assert.isOk(allPaths.twoway.length >= 0, 'allPaths.twoway.length => 0')
      assert.isOk(allPaths.twoway.length <=  allPaths.outgoing.length, 'allPaths.twoway.length <=  allPaths.outgoing.length')
      assert.isOk(allPaths.twoway.length <=  allPaths.incoming.length, 'allPaths.twoway.length <=  allPaths.incoming.length')
      /*
      _forEach(allPaths.incoming, (path) => {
        console.log('I: ' + JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })
      _forEach(allPaths.outgoing, (path) => {
        console.log('O: ' + JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })
       */
    })

    it('works with Station.getAllSimplePathsByStation()', function () {
      let allPaths = station.getAllSimplePathsByStation(4)
      console.log('_keys(allPaths.outgoing): ', allPaths.outgoing) // _keys(allPaths.outgoing))
      assert.isOk(_keys(allPaths.outgoing).length > 0, '_keys(allPaths.outgoing).length > 0')
      console.log('_keys(allPaths.incoming): ', _keys(allPaths.incoming))
      assert.isOk(_keys(allPaths.incoming).length > 0, '_keys(allPaths.incoming).length > 0')
      console.log('_keys(allPaths.all): ', _keys(allPaths.all))
      assert.isOk(_keys(allPaths.all).length > 0, '_keys(allPaths.all).length > 0')
      assert.isOk(_keys(allPaths.all).length >=  _keys(allPaths.outgoing).length, '_keys(allPaths.all).length >=  _keys(allPaths.outgoing).length')
      assert.isOk(_keys(allPaths.all).length >=  _keys(allPaths.incoming).length, '_keys(allPaths.all).length >=  _keys(allPaths.incoming).length')

      console.log('_keys(allPaths.twoway): ', _keys(allPaths.twoway))
      assert.isOk(_keys(allPaths.twoway).length > 0, '_keys(allPaths.twoway).length > 0')
      assert.isOk(_keys(allPaths.twoway).length <=  _keys(allPaths.outgoing).length, '_keys(allPaths.twoway).length <=  _keys(allPaths.outgoing).length')
      assert.isOk(_keys(allPaths.twoway).length <=  _keys(allPaths.incoming).length, '_keys(allPaths.twoway).length <=  _keys(allPaths.incoming).length')
      /*
      _forEach(allPaths.incoming, (path) => {
        console.log('I: ' + JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })
      _forEach(allPaths.outgoing, (path) => {
        console.log('O: ' + JSON.stringify(_map(path, (pathStation) => { return pathStation.call })))
      })
       */
    })
  })
})
