const helper = require('./src/utils/helperHandler');
const moment = require('moment-timezone');
const { USER_SERVER, DATE_SERVER, LINE_SERVER, AUTH_TOKEN } = process.env;

const date = `10/10/2019`;

_multiLoad = async (date, n) => {
  const [dd, mm, yy] = _parseDate(date);

  for (let i = 0; i < n; i++) {
    const t = moment()
      .subtract(i, 'day')
      .tz('Asia/Bangkok')
      .format('DD/MM/YYYY');

    console.log(t);
    await helper.handleCornJob(t);
  }
};

_parseDate = time => time.split('/').map(t => parseInt(t, 10));

// _multiLoad(date, 80);
helper.handleCornJob(date);
