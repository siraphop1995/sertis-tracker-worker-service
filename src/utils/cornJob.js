const cron = require('node-cron');
const helper = require('./helperHandler');
const moment = require('moment-timezone');

// schedule tasks to be run on the server
cron.schedule(
  '*/20 * * * * *',
  () => {
    var date = moment()
      .subtract(1, 'day')
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');

    helper.handleCornJob(date);
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);

module.exports = cron;
