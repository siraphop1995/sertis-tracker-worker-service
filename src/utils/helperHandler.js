/**
 * This file handle the cretion, load, verify and save data
 * of any date.
 */
const csv = require('csvtojson');
const db = require('./dbHandler');
const csvFilePath = __dirname + '/clockingData.csv';

/**
 * Main function that will handle other function.
 * Load data from line db.
 * Load data from csv file.
 *
 * @param     {string} date - date to handle
 * @example    handleCornJob('10,10,2019')
 */
handleCornJob = async date => {
  try {
    console.log('cornJob handling date:', date);

    // load date from date service database
    let dateData = await db.findDate(date);

    //  if date does not exist, create new date
    dateData = dateData ? dateData : await db.createDate(date);

    // //  stop the process if not workday
    // const { dateType } = dateData;
    // if (dateType !== 'workday') {
    //   console.log(`Date is a ${dateType}, exiting......`);
    //   return;
    // }

    //  load line data and filter for the lastest message
    dateData = await _updateLineData(date, dateData);

    //  get a timeList of selected date
    const timeList = await _loadDateList(date);

    //  if no date in csv file, exit

    // get a list of user with filter IN and OUT time
    const filterUserList = _filterList(dateData.users, timeList);

    const verifyUserList = await _verifyUserTime(filterUserList);
    const updateRes = await db.updateDateUserList(verifyUserList, dateData._id);

    if (timeList.length === 0) {
      console.log(`No date found....................`);
    } else {
      console.log('Date found, add complete');
    }
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  }
};

/**
 * Load line data and find the lastest message of each user,
 * set expectedWorkTime according to line intent
 *
 * @param     {string} date - date to query from line service
 * @param     {Object} dateData - date data object to save data
 * @returns   {Object} dateData
 */
_updateLineData = async (date, dateData) => {
  // load date from line service database
  let lineData = await findLine(date);

  //  if line does not exist, create new line
  lineData = lineData ? lineData : await db.createLine(date);
  const { history } = lineData;

  // filter to find all line message of each user
  dateData.users = dateData.users.map(user => {
    user.expectedWorkTime = dateData.dateType !== 'workday' ? 0 : 480;
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

    // set expectedWorkTime according to intent
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
};

/**
 * Load time data from csv file and filter out only selected
 * date then load userList from database
 *
 * @param     {string} date - date to filter from clockingList.json
 * @returns   {Object} dateData
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
 * Filter time list for user IN and OUT time.
 * Will find earliest IN time and lastest OUT time of user
 *
 * @param     {Object} userList
 * @param     {Object} timeList
 * @returns   {Object} userList
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

/**
 * Find the earliest IN time of user
 *
 * @param     {string} oldTime
 * @param     {string} newTime
 * @returns   {string} time
 */
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

/**
 * Find the lastest OUT time of user
 *
 * @param     {string} oldTime
 * @param     {string} newTime
 * @returns   {string} time
 */
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

/**
 * Remove second slot from time
 *
 * @param     {string} time
 * @returns   {string} time
 */
_removeSecond = time => {
  let [hh, mm] = time.split(':');
  hh = hh.length == 2 ? hh : `0${hh}`;
  mm = mm.length == 2 ? mm : `0${mm}`;
  return `${hh}:${mm}`;
};

/**
 * Map user List so that extra info appear in user.data
 *
 * @param     {Object} userList
 * @returns   {Object} userList
 */
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

/**
 * Verify that each user work the correct amount of expectedWorkTime.
 * When calculating, will limit the lastest outTime of user to 19:30.
 * When calculating breakHour, will check if user come during or after
 * break time and recalculate break time accordingly.
 *
 * @param     {Object} userList
 * @returns   {Object} userList
 */
_verifyUserTime = async userList => {
  // map user data before returning the data
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
        let breakHour = _checkBreakTime(inTime, outTime);

        outTime = _limitOutTime(outTime);
        const totalWorkTime = _subtractTime(inTime, outTime);
        const actualWorkTime = totalWorkTime - breakHour;
        user.totalWorkTime = totalWorkTime;
        user.actualWorkTime = actualWorkTime < 0 ? 0 : actualWorkTime;
      }
      const { actualWorkTime, expectedWorkTime } = user;

      user.status =
        actualWorkTime >= expectedWorkTime ? 'complete' : 'incomplete';

      return user;
    })
  );
};

/**
 * Find time difference between two time period.
 *
 * @param     {string} inTime
 * @param     {string} outTime
 * @returns   {string} time
 */
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

/**
 * Subtract time by taking a string input and return
 * and difference between two time period in munber
 *
 * @param     {string} inTime
 * @param     {string} outTime
 * @returns   {number} time
 */
_subtractTime = (inTime, outTime) => {
  inTime = _toMinute(inTime);
  outTime = _toMinute(outTime);
  return outTime - inTime;
};

/**
 * Parse date string into array of date (number)
 *
 * @param     {string} date - string of date
 * @returns   {number} number
 */
_parseTime = time => time.split(':').map(t => parseInt(t, 10));

/**
 * Convert time in number(min) to string(hour)
 *
 * @param     {number} time - time in minute
 * @returns   {string} time in hour
 */
_toHour = time => {
  if (typeof time == 'undefined') return undefined;
  let hh = Math.floor(time / 60);
  let mm = Math.floor(time - hh * 60);
  hh = hh < 10 ? '0' + hh : hh;
  mm = mm < 10 ? '0' + mm : mm;
  return `${hh}:${mm}`;
};

/**
 * Convert time in number(min) to string(hour)
 *
 * @param     {string} time - time in hour
 * @returns   {number} time in minute
 */
_toMinute = time => {
  const [hh, mm] = _parseTime(time);
  return hh * 60 + mm;
};

/**
 * Check if outTime is greater than 19:30.
 * if it is, limite it to 19:30
 *
 * @param     {string} time - time
 * @returns   {string} time
 */
_limitOutTime = time => {
  let [hh, mm] = _parseTime(time);
  if (hh == 19 && mm > 30) {
    mm = 30;
  } else if (hh > 19) {
    hh = 19;
    mm = 30;
  }
  return `${hh}:${mm}`;
};

/**
 * Check if user come during break time, if the user does,
 * recalculate breaktime accordingly.
 * Breaktime will start at 12:30 and end at 13:30
 *
 * @param     {string} time - time
 * @returns   {string} time
 */
_checkBreakTime = (inTime, outTime) => {
  const [inH, inM] = _parseTime(inTime);
  const [outH, outM] = _parseTime(outTime);

  if (outH <= 12) {
    if (outH == 12 && outM < 30) return 0;
    if (outH < 12) return 0;
  }

  let breakTime = 60;
  switch (inH) {
    case 12:
      if (inM >= 30) {
        breakTime = _findTimeDiff(inTime, '13:30:00');
        breakTime = _toMinute(breakTime);
      }
      break;
    case 13:
      if (inM <= 30) {
        breakTime = _findTimeDiff(inTime, '13:30:00');
        breakTime = _toMinute(breakTime);
      }
  }
  if (inH >= 13) {
    if (inH == 13 && inM > 30) breakTime = 0;
    if (inH >= 14) breakTime = 0;
  }
  return breakTime;
};

module.exports = {
  handleCornJob
};
