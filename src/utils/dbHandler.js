const axios = require('axios');
const { USER_SERVER, DATE_SERVER, LINE_SERVER, AUTH_TOKEN } = process.env;
axios.defaults.headers.common['authorization'] = AUTH_TOKEN;

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

findDate = async dateQuery => {
  return (
    await axios.post(`${DATE_SERVER}/findDate`, {
      dateQuery: dateQuery
    })
  ).data.date;
};

createDate = async dateQuery => {
  return (
    await axios.post(`${DATE_SERVER}/createDate`, {
      dateQuery: dateQuery
    })
  ).data.date;
};

updateDateUserList = async (userList, dateId) => {
  return (
    await axios.post(`${DATE_SERVER}/updateDateUserList`, {
      userList: userList,
      dateId: dateId
    })
  ).data.date;
};

findLine = async dateQuery => {
  return (
    await axios.post(`${LINE_SERVER}/findLine`, {
      dateQuery: dateQuery
    })
  ).data.line;
};

createLine = async dateQuery => {
  return (
    await axios.post(`${LINE_SERVER}/createLine`, {
      dateQuery: dateQuery
    })
  ).data.line;
};

module.exports = {
  getUserList,
  findDate,
  createDate,
  updateDateUserList,
  findLine,
  createLine
};
