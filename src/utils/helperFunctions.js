var xlsx = require('node-xlsx');
var fs = require('fs');

async function updateData(req, res) {
  try {
    console.log('updating');
  } catch (err) {}
}

async function loadFile(req, res, next) {
  try {
    console.log('Loading');
    // var obj = xlsx.parse(__dirname + '/clockingData.xlsx'); // parses a file
    const contents = xlsx.parse(fs.readFileSync(__dirname + '/clockingData.xlsx'));
    // let list = JSON.parse(contents);

    console.log(contents[0].data)
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  updateData,
  loadFile
};
