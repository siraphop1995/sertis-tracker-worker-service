/**
 * This is a test script for development and testing purpose.
 * This script are meant to be run through 
 * `pm2 start testScript.config.js` command
 * 
 * This script can load mulpitle date at the same time
 */

const helper = require('./src/utils/helperHandler');
const moment = require('moment-timezone');

//  default are yesterday date
let date = moment()
  .subtract(1, 'day')
  .tz('Asia/Bangkok')
  .format('DD/MM/YYYY');
// date = `28/11/2019`;

/**
 * Load multiple date to db
 * @param     {string} date - start date to load
 * @param     {number} n - number to date to load
 * @example    _multiLoad(date, 120)
 */
_multiLoad = async (date, n) => {
  const [dd, mm, yy] = _parseDate(date);

  for (let i = 0; i < n; i++) {
    const t = moment()
      .subtract(i, 'day')
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');

    await helper.handleCornJob(t);
  }
};

/**
 * Parse date string into array of date (number)
 * @param     {string} date - string of date
 * @returns   {number} number
 * @example    _parseDate('10/10/2019')
 */
_parseDate = time => time.split('/').map(t => parseInt(t, 10));



// _multiLoad(date, 120);
helper.handleCornJob(date);
