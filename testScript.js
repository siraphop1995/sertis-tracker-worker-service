/**
 * This is a test script for development and testing purpose.
 * This script are meant to be run through
 * `pm2 start testScript.config.js` command
 *
 * This script can load mulpitle date at the same time
 */

const helper = require('./src/utils/helperHandler');
const moment = require('moment-timezone');
const csv = require('csvtojson');
const csvFilePath = __dirname + '/src/utils/clockingData.csv';

//  default are yesterday date
let date = moment()
  .subtract(1, 'day')
  .tz('Asia/Bangkok')
  .format('DD/MM/YYYY');
date = `30/11/2019`;

/**
 * Load multiple date to db
 * @param     {string} date - start date to load
 * @param     {number} n - number to date to load
 * @example    _multiLoad(date, 120)
 */
_multiLoad = async (date, n) => {
  const [dd, mm, yy] = _parseDate(date);

  for (let i = 0; i < n; i++) {
    const t = moment([yy, mm - 1, dd])
      .subtract(i, 'day')
      .tz('Asia/Bangkok')
      .format('D/MM/YYYY');
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

/**
 * Format csv data
 */
cleanCSVFile = async () => {
    // list of all date form csv
    const clockingList = await csv().fromFile(csvFilePath);
  
    // list of selected date from csv
    const timeList = clockingList.map(clocking => {
      const [dd, mm, yy] = _parseDate(clocking.date);
      clocking.date == moment([yy,mm-1,dd]).format('DD/MM/YYYY');
      if(clocking.date=='9/11/2019'){
        console.log(clocking.date, moment([yy,mm-1,dd]).format('DD/MM/YYYY'))
      }
      return clocking
    });
    console.log(timeList.filter((c)=>{
      return c.date == '09/11/2019'
    }))
    return timeList;
};

// cleanCSVFile(date)
// _multiLoad(date, 70);
// helper.handleCornJob(date);
