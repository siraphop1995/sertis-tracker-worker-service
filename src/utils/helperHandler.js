const csv = require('csvtojson');
const db = require('./dbHandler');
const csvFilePath = __dirname + '/clockingData.csv';
const errorHandler = require('./errorHandler');

loadFile = async () => {
  try {
    console.log('Loading...');
    const date = `10/10/2019`;

    //get a timeList of selected date
    const timeList = await _handleDate(date);

    // list of all employee
    const userList = await db.getUserList();

    // get a list of user with filter IN and OUT time
    const filterUserList = _filterList(userList, timeList);

    // get selected from db
    const dbRes = await db.findDate(date);
    console.log(dbRes);

    const verifyUserList = await _verifyUserTime(filterUserList);

    // console.log(verifyUserList);
    console.log('END');
  } catch (err) {
    err.location = 'loadFile()';
    errorHandler(err);
  }
};

updateData = async () => {
  try {
    console.log('updating');
  } catch (err) {
    errorHandler(err);
  }
};

/**
 * Load time data from csv file and filter out only selected
 * date then load userList from database
 */
_handleDate = async date => {
  // list of all date form csv
  const clockingList = await csv().fromFile(csvFilePath);

  // list of selected date from csv
  const timeList = clockingList.filter(clocking => {
    return clocking.date === date;
  });
  return timeList;
};

/**
 * Filter timeList so that only select the
 * time where that user exist in database
 */
_filterList = (userList, timeList) => {
  for (i in timeList) {
    const time = timeList[i];
    // only find user with data in user database
    const user = userList.findIndex(user => user.uid === time.uid);
    if (user === -1) continue;

    // find the earliest inTime and lastest outTime for each user
    switch (time.action) {
      case 'IN':
        userList[user].inTime = _handleInTime(userList[user].inTime, time.time);
        break;
      case 'OUT':
        userList[user].outTime = _handleOutTime(
          userList[user].outTime,
          time.time
        );
    }
  }
  return userList;
};

_handleInTime = (oldTime, newTime) => {
  if (!oldTime) return newTime;

  const [newH, newM] = _parseTime(newTime);
  const [oldH, oldM] = _parseTime(oldTime);

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

  const [newH, newM] = _parseTime(newTime);
  const [oldH, oldM] = _parseTime(oldTime);

  return newH > oldH
    ? newTime
    : newH < oldH
    ? oldTime
    : newM > oldM
    ? newTime
    : oldTime;
};

_verifyUserTime = async userList => {
  return userList.map(user => {
    const { inTime, outTime } = user;
    if (!inTime || !outTime) {
      user.status = 'reject';
      return user;
    }
    const [inH, inM] = _parseTime(inTime);
    const [outH, outM] = _parseTime(outTime);
    var inDate = new Date(2000, 0, 1, inH, inM);
    var outDate = new Date(2000, 0, 1, outH, outM);
    var diff = outDate - inDate;
    var msec = diff;
    var hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    user.totalHour = `${hh}.${mm}`;
    if (hh >= 9) {
      user.status = 'verify';
      user.actual = `${hh - 1}.${mm}`;
    } else {
      user.statis = 'incomplete';
    }
    console.log(user.uid, `${outH}:${outM}-${inH}:${inM}`, '=>', `${hh}:${mm}`);
    return user;
  });
};

_parseTime = time => time.split(':').map(t => parseInt(t, 10));

_calculateTime = () => {};

module.exports = {
  updateData,
  loadFile
};
