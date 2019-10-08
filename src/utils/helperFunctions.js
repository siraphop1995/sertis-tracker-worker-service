const User = require('../models/userListModel');

async function updateData(req, res, next) {
  try {
    const user = await User.find({}, null);
    console.log(user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateData: updateData
};
