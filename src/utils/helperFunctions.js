const csv = require('csvtojson');

async function updateData(req, res) {
  try {
    console.log('updating');
  } catch (err) {}
}

async function loadFile(req, res, next) {
  try {
    console.log('Loading');
    const csvFilePath = __dirname + '/clockingData.csv';

    csv()
      .fromFile(csvFilePath)
      .then(jsonObj => {
        console.log(jsonObj);
      });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  updateData,
  loadFile
};
