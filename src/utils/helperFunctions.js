async function updateData(req, res, next) {
  try {
    console.log('updating');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateData
};
