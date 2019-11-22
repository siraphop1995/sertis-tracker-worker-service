const csv = require('csvtojson');
const db = require('./dbHandler');
const csvFilePath = __dirname + '/clockingData.csv';
const errorHandler = require('./errorHandler');

handleCornJob = async date => {
  try {
    // date = '03/10/2019';

    // get selected from db
    let dateData = await db.findDate(date);
    dateData = dateData ? dateData : await db.createDate(date);

    const { dateType } = dateData;
    if (dateType !== 'workday') {
      console.log(`Date is a ${dateType}, exiting......`);
      return;
    }

    dateData = await _updateLineData(date, dateData);
    // //get a timeList of selected date
    const timeList = await _loadDateList(date);

    if (timeList.length === 0) {
      console.log(`No date found, exting......`);
      return;
    }

    // get a list of user with filter IN and OUT time
    const filterUserList = _filterList(dateData.users, timeList);

    const verifyUserList = await _verifyUserTime(filterUserList);

    const updateRes = await db.updateDateUserList(verifyUserList, dateData._id);

    dateData.users = verifyUserList;
    console.log('Date found, add complete');
    return Promise.resolve();
  } catch (err) {
    err.location = 'loadFile()';
    errorHandler(err);
  }
};

_updateLineData = async (date, dateData) => {
  try {
    let lineData = await findLine(date);
    lineData = lineData ? lineData : await db.createLine(date);
    const { history } = lineData;

    dateData.users = dateData.users.map(user => {
      user.expectedWorkTime = 480;
      // find line message of user
      let lineHistory = history.filter(h => {
        return (
          h.uid === user.uid &&
          h.isVerify &&
          (h.messageIntent === 'leaveIntent' ||
            h.messageIntent === 'absentIntent' ||
            h.messageIntent === 'longAbsentIntent')
        );
      });

      // if no line message, exit
      if (lineHistory.length === 0) return user;

      // return lastest line message of user
      lineHistory = lineHistory.reduce((prev, current) =>
        prev.timestamp > current.timestamp ? prev : current
      );

      switch (lineHistory.messageIntent) {
        case 'leaveIntent':
          user.expectedWorkTime = 480 - lineHistory.messageVar.time * 60;
          break;
        case 'absentIntent':
          user.expectedWorkTime = 0;
          break;
        case 'longAbsentIntent':
          user.expectedWorkTime = 0;
          break;
      }
      user.lineHistoryId = lineHistory._id;
      user.lineIntent = lineHistory.messageIntent;
      user.lineMessage = lineHistory.message;

      return user;
    });
    return dateData;
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
  if (!oldTime) return _removeSecond(newTime);

  const [newH, newM] = _parseTime(newTime);
  const [oldH, oldM] = _parseTime(oldTime);

  return _removeSecond(
    newH < oldH
      ? newTime
      : newH > oldH
      ? oldTime
      : newM < oldM
      ? newTime
      : oldTime
  );
};

_handleOutTime = (oldTime, newTime) => {
  if (!oldTime) return _removeSecond(newTime);

  const [newH, newM] = _parseTime(newTime);
  const [oldH, oldM] = _parseTime(oldTime);

  return _removeSecond(
    newH > oldH
      ? newTime
      : newH < oldH
      ? oldTime
      : newM > oldM
      ? newTime
      : oldTime
  );
};

_removeSecond = time => {
  let [hh, mm] = time.split(':');
  hh = hh.length == 2 ? hh : `0${hh}`;
  mm = mm.length == 2 ? mm : `0${mm}`;
  return `${hh}:${mm}`;
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
        totalWorkTime: _toHour(user.totalWorkTime),
        actualWorkTime: _toHour(user.actualWorkTime),
        expectedWorkTime: _toHour(user.expectedWorkTime),
        lineHistoryId: user.lineHistoryId,
        lineIntent: user.lineIntent,
        lineMessage: user.lineMessage
      }
    };
  });
};

_verifyUserTime = async userList => {
  return _mapUserData(
    userList.map(user => {
      user.expectedWorkTime =
        typeof user.expectedWorkTime != 'undefined'
          ? user.expectedWorkTime
          : 480;
      let { inTime, outTime } = user;

      if (!inTime || !outTime) {
        user.totalWorkTime = 0;
        user.actualWorkTime = 0;
      } else {
        let breakHour = _checkBreakTime(inTime);

        breakHour = breakHour ? breakHour : 60;

        outTime = _limitOutTime(outTime);
        const totalWorkTime = _subtractTime(inTime, outTime);
        const actualWorkTime = totalWorkTime - breakHour;
        user.totalWorkTime = totalWorkTime;
        user.actualWorkTime = actualWorkTime;
      }
      const { actualWorkTime, expectedWorkTime } = user;

      user.status =
        actualWorkTime >= expectedWorkTime ? 'complete' : 'incomplete';

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
  if (typeof time == 'undefined') return undefined;
  let hh = Math.floor(time / 60);
  let mm = Math.floor(time - hh * 60);
  hh = hh < 10 ? '0' + hh : hh;
  mm = mm < 10 ? '0' + mm : mm;
  return `${hh}:${mm}`;
};

_toMinute = time => {
  const [hh, mm] = _parseTime(time);
  return hh * 60 + mm;
};

_limitOutTime = time => {
  let [hh, mm] = _parseTime(time);
  if (hh > 19) {
    hh = 19;
    if (mm > 30) {
      mm = 30;
    }
  }
  return `${hh}:${mm}`;
};

_checkBreakTime = time => {
  const [inH, inM] = _parseTime(time);

  let breakTime = 60;
  switch (inH) {
    case 12:
      if (inM >= 30) {
        breakTime = _findTimeDiff(time, '13:30:00');
      }
      break;
    case 13:
      if (inM <= 30) {
        breakTime = _findTimeDiff(time, '13:30:00');
      }
  }
  if (inH >= 13 && inM > 30) breakTime = 0;
  return breakTime;
};

module.exports = {
  handleCornJob
};
