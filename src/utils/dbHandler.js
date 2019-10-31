const axios = require('axios');
const { USER_SERVER, DATE_SERVER, LINE_SERVER } = process.env;

getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.map(user => {
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
  return (await axios.post(`${DATE_SERVER}/findDate`, {
    dateQuery: dateQuery
  })).data.date
};

module.exports = {
  getUserList,
  findDate
};
