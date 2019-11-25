'use strict';
// const helper = require('./helperHandler');
const moment = require('moment-timezone');

module.exports = err => {
  console.log('errorHandler');
  console.error(err.message, 'at', err.location);
};
