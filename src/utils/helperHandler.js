const csv = require('csvtojson');
const db = require('./dbHandler');
const csvFilePath = __dirname + '/clockingData.csv';

updateData = async () => {
  try {
    console.log('updating');
  } catch (err) {}
};

loadFile = async () => {
  try {
    console.log('Loading...');
    const date = `10/10/2019`;
    const filterList = await _handleDate(date);
    console.log(filterList);
    console.log('END');
  } catch (err) {
    console.log(err);
  }
};

_handleDate = async date => {
  const clockingList = await csv().fromFile(csvFilePath);
  const timeList = clockingList.filter(clocking => {
    return clocking.date === date;
  });
  const userList = await db.getUserList();
  return _filterList(userList, timeList);
};

_filterList = (userList, timeList) => {
  for (i in timeList) {
    const time = timeList[i];
    const user = userList.findIndex(user => user.employeeId === time.uid);
    if (user === -1) continue;

    switch (time.action) {
      case 'IN':
        userList[user].inTime = _handleInTime(userList[user].inTime, time.time);
        break;
      case 'OUT':
        userList[user].outTime = _handleOutTime(
          userList[user].outTime,
          time.time
        );
        break;
    }
  }
  return userList;
};

_handleInTime = (oldTime, newTime) => {
  if (!oldTime) return newTime;

  const timeString = newTime.split(':').concat(oldTime.split(':'));
  const [newH, newM, newS, oldH, oldM, oldS] = timeString.map(t =>
    parseInt(t, 10)
  );

  return newH < oldH
    ? newTime
    : newH > oldH
    ? oldTime
    : newM < oldM
    ? newTime
    : oldTime;
};

_handleOutTime = (oldTime, newTime) => {
  if (!oldTime) {
    return newTime;
  }

  const timeString = newTime.split(':').concat(oldTime.split(':'));
  const [newH, newM, newS, oldH, oldM, oldS] = timeString.map(t =>
    parseInt(t, 10)
  );

  return newH > oldH
    ? newTime
    : newH < oldH
    ? oldTime
    : newM > oldM
    ? newTime
    : oldTime;
};

module.exports = {
  updateData,
  loadFile
};
