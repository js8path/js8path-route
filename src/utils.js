/*
    JS8Path utility functions
    utils.js
*/

import _find from 'lodash/find'
import _isEqual from 'lodash/isEqual'
import _uniqWith from 'lodash/uniqWith'
import _isNumber from 'lodash/isNumber'

let utils = {}

utils.bandFromHz = function (freqHz) {
  // answer a string representation of the frequency band
  let band = '??'
  if (_isNumber(freqHz)) {
    if (freqHz > 0) {
      band = String(Math.floor(Math.max(0, freqHz / 1000000)))
    }
  }
  return band
}

utils.addReportToList = function (reportsList, newReport) {
  // add newReport to reportsList, unless it is already in reportsList
  if (!_find(reportsList, function (existingReport) { return _isEqual(existingReport, newReport) })) {
    reportsList.push(newReport)
  }
}

utils.deduplicateReportList = function (reportsList) {
  // return a copy of reportsList with all duplicates removed
  return _uniqWith(reportsList, _isEqual)
}

export default utils
