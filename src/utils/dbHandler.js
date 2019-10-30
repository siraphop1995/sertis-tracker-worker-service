const axios = require('axios');
const { USER_SERVER, DATE_SERVER, LINE_SERVER } = process.env;

getUserList = async () => {
  return (await axios.get(`${USER_SERVER}/getAllUsers`)).data.map(user => {
    return {
      _id: user._id,
      lineId: user.lineId,
      employeeId: user.employeeId,
      inTime: undefined,
      outTime: undefined
    };
  });
};

module.exports = {
  getUserList
};
