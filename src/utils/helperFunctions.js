const csv = require('csvtojson');
const axios = require('axios');
const { USER_SERVER, DATE_SERVER, LINE_SERVER } = process.env;
updateData = async () => {
  try {
    console.log('updating');
  } catch (err) {}
};

loadFile = async () => {
  try {
    console.log('Loading...');
    const csvFilePath = __dirname + '/clockingData.csv';

    const clockingList = await csv().fromFile(csvFilePath);
    const currentList = clockingList.filter(clocking => {
      return clocking.date === '10/10/2019';
    });
    const userList = await _getUserList();
    console.log(userList)
    // const filterList = _filterList(userList, currentList);
  } catch (err) {
    console.log(err);
  }
};

_getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.map(user => {
    return {
      _id: user._id,
      lineId: user.lineId,
      employeeId: user.employeeId
    };
  });
};

_filterList = async (userList, currentList) => {
  console.log(userList);
  console.log(currentList[0]);

  for (i in currentList) {
    const user = userList.find(user => user.employeeId === currentList[i].uid);
    if(user){
      const userIndex = userList.indexOf(user)
    }
  }

  return '14';
};

module.exports = {
  updateData,
  loadFile
};
