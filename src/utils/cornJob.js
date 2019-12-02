const cron = require('node-cron');
const helper = require('./helperHandler');
const moment = require('moment-timezone');
const db = require('./dbHandler');
const axios = require('axios');

cron.schedule('*/20 * * * *', () => {
  let date = moment()
    .subtract(1, 'day')
    .tz('Asia/Bangkok');
  console.log('Run test:', date.format());
  axios.get('https://stt-user-service.herokuapp.com/').then(res => {
    console.log(res.data.message);
  });
  axios.get('https://stt-date-service.herokuapp.com').then(res => {
    console.log(res.data.message);
  });
  axios.get('https://stt-line-service.herokuapp.com').then(res => {
    console.log(res.data.message);
  });
});

cron.schedule(
  '0 */1 * * *',
  async () => {
    let date = moment()
      .subtract('day')
      .tz('Asia/Bangkok');
    console.log('Timer log schedule:', date.format());
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);

/**
 * Special schedule to wake up Heroku service.
 */
cron.schedule(
  '50-55 12 * * *',
  () => {
    let date = moment()
      .subtract('day')
      .tz('Asia/Bangkok');
    console.log('Wake up schedule:', date.format());
    db.helloUser().then(res => {
      console.log(res.message);
    });
    db.helloDate().then(res => {
      console.log(res.message);
    });
    db.helloLine().then(res => {
      console.log(res.message);
    });
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);

/**
 * Daily schedule which run every 1am to handle user/line data.
 * If error occur, will retry up to 12 times. Each retry will
 * occor on incremental delay.
 */
cron.schedule(
  '0 9 * * *',
  async () => {
    let date = moment()
      .subtract(1, 'day')
      .tz('Asia/Bangkok');
    console.log('Run cornJob schedule:', date.format());

    let success = false;
    let count = 0;
    const maxCount = 12; //no of retry
    const retryTimer = 300000; //5 min in milisecond

    date = date.format('DD/MM/YYYY');
    while (!success && count < maxCount) {
      await new Promise(resolve =>
        setTimeout(async () => {
          await helper
            .handleCornJob(date)
            .then(() => {
              console.log('cornSuccess, tries:', count + 1);
              success = true;
            })
            .catch(err => {
              console.log('cornError, tries:', count + 1);
            });
          resolve();
        }, count * retryTimer)
      );
      count++;
    }
    console.log(success ? 'Success' : 'Fail', 'cornJob, tries:', count);
  },
  {
    scheduled: true,
    timezone: 'Asia/Bangkok'
  }
);

// // Special schedule
// cron.schedule(
//   '50 46 11 * * *',
//   async () => {
//     let date = `28/11/2019`;
//     console.log('Run cornJob special schedule:', date);

//     _multiLoad(date, 30);
//   },
//   {
//     scheduled: true,
//     timezone: 'Asia/Bangkok'
//   }
// );

_multiLoad = async (date, n) => {
  const [dd, mm, yy] = _parseDate(date);

  for (let i = 0; i < n; i++) {
    const t = moment([yy, mm - 1, dd])
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


module.exports = cron;
