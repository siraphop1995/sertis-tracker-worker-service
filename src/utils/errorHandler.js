'use strict';

module.exports = err => {
  console.log('errorHandler');
  console.error(err.message, 'at', err.location);
};
