const { getUser } = require("../../utils/db.util");

function getUserById(id) {
  return new Promise((resolve, reject) => {
    getUser(id, (err, result) => {
      if (err) {
        console.log(err);
        resolve(err);
      } else {
        resolve(result);
      }
    });
  });
}
module.exports = { getUserById };
