const cron = require('node-cron');
const helper = require('./helperHandler');
const moment = require('moment-timezone');
const db = require('./dbHandler');

// cron.schedule('*/10 * * * * *', () => {
//   let date = moment()
//     .subtract(1, 'day')
//     .tz('Asia/Bangkok');
//   console.log('Run test:', date.format());
//   db.helloUser().then(res => {
//     console.log(res.message);
//   });
//   db.helloDate().then(res => {
//     console.log(res.message);
//   });
//   db.helloLine().then(res => {
//     console.log(res.message);
//   });
// });

cron.schedule('0 */1 * * *', async () => {
  let date = moment()
    .subtract('day')
    .tz('Asia/Bangkok');
  console.log('Timer log:', date.format());
});

cron.schedule('*/5 * * * * *', () => {
  let date = moment()
    .subtract('day')
    .tz('Asia/Bangkok');
  console.log('Wake up service:', date.format());
  db.helloUser().then(res => {
    console.log(res.message);
  });
  db.helloDate().then(res => {
    console.log(res.message);
  });
  db.helloLine().then(res => {
    console.log(res.message);
  });
});

// schedule tasks to be run on the server
cron.schedule(
  '*/20 * * * * *',
  async () => {
    let date = moment()
      .subtract(1, 'day')
      .tz('Asia/Bangkok');
    console.log('Run cornJob:', date.format());

    let success = false;
    let count = 0;
    const maxCount = 12;
    const retryTimer = 300000; //5 min in milisecond
    // let name = date.format('ddd');
    // if (name == 'Sat' || name == 'Sun') {
    //   console.log('Weekend, exiting...');
    //   return;
    // }
    date = date.format('DD/MM/YYYY');

    while (!success && count < maxCount) {
      await new Promise(resolve =>
        setTimeout(async () => {
          await helper
            .handleCornJob(date)
            .then(() => {
              console.log('cornSuccess, count:', count);
              success = true;
            })
            .catch(err => {
              console.log('cornError, count:', count);
            });
          resolve();
        }, count * retryTimer)
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
