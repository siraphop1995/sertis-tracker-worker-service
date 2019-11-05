const csv = require('csvtojson');
const db = require('./dbHandler');
const csvFilePath = __dirname + '/clockingData.csv';
const errorHandler = require('./errorHandler');

handleCornJob = async date => {
  try {
    date = '08/10/2019';

    _updateLineData(date);

    // // get selected from db
    // let dateRes = await db.findDate(date);
    // dateRes = dateRes ? dateRes : await db.createDate(date);
    // const { dateType } = dateRes;
    // if (dateType !== 'workday') {
    //   console.log(`Date is a ${dateType}, exiting......`);
    //   return;
    // }
    // //get a timeList of selected date
    // const timeList = await _loadDateList(date);

    // // list of all employee
    // const userList = await db.getUserList();

    // // get a list of user with filter IN and OUT time
    // const filterUserList = _filterList(userList, timeList);

    // const verifyUserList = await _verifyUserTime(filterUserList);

    // // const updateRes = await db.updateDateUser(verifyUserList, dateRes._id);

    // dateRes.users = verifyUserList;
    // // console.log(dateRes.users);
    console.log('END');
  } catch (err) {
    err.location = 'loadFile()';
    errorHandler(err);
  }
};

_updateLineData = async date => {
  try {


  } catch (err) {
    err.location = '_updateLineData()';
    errorHandler(err);
  }
};

/**
 * Load time data from csv file and filter out only selected
 * date then load userList from database
 */
_loadDateList = async date => {
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

_mapUserData = userList => {
  return userList.map(user => {
    return {
      _id: user._id,
      uid: user.uid,
      lid: user.lid,
      data: {
        status: user.status,
        inTime: user.inTime,
        outTime: user.outTime,
        totalWorkTime: user.totalWorkTime,
        actualWorkTime: user.actualWorkTime,
        expectedWorkTime: user.expectedWorkTime
      }
    };
  });
};

_verifyUserTime = async userList => {
  return _mapUserData(
    userList.map(user => {
      user.expectedWorkTime = 480;

      let { inTime, outTime } = user;

      if (!inTime || !outTime) {
        user.totalWorkTime = 0;
        user.actualWorkTime = 0;
      } else {
        let breakHour = _checkInTime(inTime);
        breakHour = breakHour ? breakHour : 60;
        const totalWorkTime = _subtractTime(inTime, outTime);
        const actualWorkTime = totalWorkTime - breakHour;
        user.totalWorkTime = totalWorkTime;
        user.actualWorkTime = actualWorkTime;
      }
      const { actualWorkTime, expectedWorkTime } = user;

      user.status =
        actualWorkTime >= expectedWorkTime ? 'verify' : 'incomplete';

      return user;
    })
  );
};

_findTimeDiff = (inTime, outTime) => {
  const [inH, inM] = _parseTime(inTime);
  const [outH, outM] = _parseTime(outTime);
  var inDate = new Date(2000, 0, 1, inH, inM);
  var outDate = new Date(2000, 0, 1, outH, outM);
  var diff = outDate - inDate;

  var msec = diff;
  var hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60);

  return `${hh}:${mm}`;
};

_subtractTime = (inTime, outTime) => {
  inTime = _toMinute(inTime);
  outTime = _toMinute(outTime);
  return outTime - inTime;
};

_parseTime = time => time.split(':').map(t => parseInt(t, 10));

_toHour = time => {
  const hh = Math.floor(time / 60);
  const mm = Math.floor(time - hh * 60);
  return `${hh}:${mm}`;
};

_toMinute = time => {
  const [hh, mm] = _parseTime(time);
  return hh * 60 + mm;
};

_checkInTime = time => {
  const [inH, inM] = _parseTime(time);

  let timeDiff = undefined;
  switch (inH) {
    case 12:
      if (inM >= 30) {
        timeDiff = _findTimeDiff(time, '13:30:00');
      }
      break;
    case 13:
      if (inM <= 30) {
        timeDiff = _findTimeDiff(time, '13:30:00');
      }
  }
  return timeDiff;
};

module.exports = {
  handleCornJob
};
