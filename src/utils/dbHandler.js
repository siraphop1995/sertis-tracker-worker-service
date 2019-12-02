const axios = require('axios');
const { USER_SERVER, DATE_SERVER, LINE_SERVER, AUTH_TOKEN } = process.env;

//set auth token to be use to authenticate with other service
axios.defaults.headers.common['authorization'] = AUTH_TOKEN;

/**
 * API request to USER_SERVER
 * GET
 *   /
 *      @return {string} hello message
 */
helloUser = async () => {
  return (await axios.get(`${USER_SERVER}/`)).data;
};

/**
 * API request to DATE_SERVER
 * GET
 *   /
 *      @return {string} hello message
 */
helloDate = async () => {
  return (await axios.get(`${DATE_SERVER}/`)).data;
};

/**
 * API request to LINE_SERVER
 * GET
 *   /
 *      @return {string} hello message
 */
helloLine = async () => {
  return (await axios.get(`${LINE_SERVER}/`)).data;
};

/**
 * API request to USER_SERVER, will map data
 * GET
 *   /getAllUsers
 *      @return {Object} User data object
 */
getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.user.map(user => {
    return {
      _id: user._id,
      lid: user.lid,
      uid: user.uid,
      inTime: undefined,
      outTime: undefined,
      status: 'unverify'
    };
  });
};

/**
 * API request to DATE_SERVER
 * POST
 *   /findUser
 *      @param dateQuery {string} date object to query.
 *      @return {Object} Date data object
 */
findDate = async dateQuery => {
  return (
    await axios.post(`${DATE_SERVER}/findDate`, {
      dateQuery: dateQuery
    })
  ).data.date;
};

/**
 * API request to DATE_SERVER
 * POST
 *   /createDate
 *      @param dateQuery {string} date to create empty date.
 *      @return {Object} Date data object
 */
createDate = async dateQuery => {
  return (
    await axios.post(`${DATE_SERVER}/createDate`, {
      dateQuery: dateQuery
    })
  ).data.date;
};

/**
 * API request to DATE_SERVER
 * POST
 *   /updateDateUserList
 *      @param userList {Object} user list to be update.
 *      @param dateId {string} date id of date to be update.
 *      @return {Object} Date data object
 */
updateDateUserList = async (userList, dateId) => {
  return (
    await axios.post(`${DATE_SERVER}/updateDateUserList`, {
      userList: userList,
      dateId: dateId
    })
  ).data.date;
};

/**
 * API request to LINE_SERVER
 * POST
 *   /findLine
 *      @param dateQuery {string} date object to query.
 *      @return {Object} Line data object
 */
findLine = async dateQuery => {
  return (
    await axios.post(`${LINE_SERVER}/findLine`, {
      dateQuery: dateQuery
    })
  ).data.line;
};

/**
 * API request to DATE_SERVER
 * POST
 *   /createLine
 *      @param dateQuery {string} date create empty line.
 *      @return {Object} Date data object
 */
createLine = async dateQuery => {
  return (
    await axios.post(`${LINE_SERVER}/createLine`, {
      dateQuery: dateQuery
    })
  ).data.line;
};

module.exports = {
  helloUser,
  helloDate,
  helloLine,
  getUserList,
  findDate,
  createDate,
  updateDateUserList,
  findLine,
  createLine
};
