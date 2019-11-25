const cron = require('node-cron');
const helper = require('./helperHandler');
const moment = require('moment-timezone');

// schedule tasks to be run on the server
cron.schedule(
  '*/10 * * * * *',
  async () => {
    let date = moment()
      .subtract(1, 'day')
      .tz('Asia/Bangkok');
    let success = false;
    let count = 0;
    let maxCount = 10;
    // let name = date.format('ddd');
    // if (name == 'Sat' || name == 'Sun') return;
    date = date.format('DD/MM/YYYY');

    while (!success && count < maxCount) {
      await new Promise(resolve =>
        setTimeout(async () => {
          await helper
            .handleCornJob(date)
            .then(() => {
              console.log('cornSuccess:', count);
              success = true;
            })
            .catch(err => {
              console.log('cornError:', count);
            });
          resolve();
        }, count * 1000)
      );
      count++;
    }
    console.log(success ? 'Success' : 'Fail', 'cornJob, count:', count);
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);

module.exports = cron;
