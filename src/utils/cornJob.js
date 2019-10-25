const cron = require('node-cron');
const helper = require('./helperFunctions')

// schedule tasks to be run on the server
cron.schedule(
  '*/10 * * * * *',
  () => {
    var d = new Date();
    console.log(d);
    helper.updateData()
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);
// helper.updateData()

module.exports = cron;
