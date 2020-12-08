/* Js8path router - test routing with big data file
mocha tests for router
test-big-data-routing.js
*/

/* global describe, it */
import _filter from 'lodash/filter'
import _last from 'lodash/last'
import _map from 'lodash/map'
import _size from 'lodash/size'
import _slice from 'lodash/slice'
import _sortBy from 'lodash/sortBy'
import _startsWith from 'lodash/startsWith'
import _uniq from 'lodash/uniq'
import _values from 'lodash/values'

import testData from '@js8path/js8path-test-data'
import js8pathRoute from '../../src/main.js'

let receptionReportList = testData.js8pathData
let Router = js8pathRoute.Router
// let Station = js8pathRoute.Station

let chai = require('chai')
let assert = chai.assert

describe('js8path-route big data routing', function () {
  describe('misc tests', function () {
    it('passes a dummy test', function () {
      assert.isOk(true)
    })
    it('has receptionReports', function () {
      assert.isOk(receptionReportList.length > 0)
    })
  })

  describe('Router with test data', function () {
    let router = new Router()
    it('loads reception reports', function () {
      return router.loadReports(receptionReportList).then(function (loadedCount) {
        assert.isOk(loadedCount > 100, 'loadedCount')
        console.log('loadedCount: ' + loadedCount)
        assert.isOk(_size(router.stations) > 10, '# of stations')
        console.log('# of stations: ' + _size(router.stations))
        let stationCalls = _sortBy(_uniq(_map(_values(router.stations), function (station) { return station.call })))
        assert.isOk(stationCalls.length > 10, '# of calls')
        console.log('stationCalls: ' + stationCalls)
        let stationRankings = _sortBy(
          _map(_values(router.stations), function (station) {
            let linkInfo = station.linkInfo()
            let stationScores = {
              key: station.key,
              txScore: linkInfo.canTxTo.length,
              rxScore: linkInfo.canRxFrom.length,
              qsoScore: linkInfo.canQsoWith.length,
              score: 0
            }
            stationScores.score = stationScores.txScore + stationScores.rxScore + 2 * stationScores.qsoScore
            return stationScores
          }),
          'score'
        )
        console.log('top 10 station rankings: ' + JSON.stringify(
          _slice(stationRankings, -10), null, 2
        ))
        let topStation = router.stations[_last(stationRankings).key]
        console.log('top station: ' + JSON.stringify(topStation.linkInfo(), null, 2))
        // let n0juh = _filter(_values(router.stations), {call:'N0JUH'})
        let n0juhStations = _filter(router.stations, { call:'N0JUH' })
        let n0juhLinkInfo = _map(n0juhStations, function (station) {return station.linkInfo()})
        console.log('N0JUH Link Info: ' + JSON.stringify(n0juhLinkInfo, null, 2))
        let n0juhRankings = _filter(stationRankings, function (ranking) {
          return _startsWith(ranking.key, '|N0JUH|')
        })
        console.log('N0JUH rankings: ' + JSON.stringify(n0juhRankings, null, 2))
      })
    })
  })
})
