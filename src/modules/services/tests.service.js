const { fs } = require("../../utils/modulesManager");
function getTests(query, callback) {
  return new Promise((resolve, reject) => {
    fs.readFile("/Users/mp/JSProjects/back/tests.json", "utf8", function(
      err,
      data
    ) {
      if (err) resolve(err);
      let testList = JSON.parse(data);
      if (
        "page" in query &&
        query.page >= 0 &&
        query.page * 10 < testList.length
      ) {
        let tests = testList.slice(query.page * 10, query.page * 10 + 10);
        let pageAmount =
          ~~(testList.length / 10) + Math.sign(testList.length % 10);
        resolve({ pageAmount, tests });
      } else {
        resolve({ pageAmount, testList });
      }
    });
  });
}
function getTestById(id, callback) {
  return new Promise((resolve, reject) => {
    fs.readFile("./tests.json", "utf8", function(err, data) {
      if (err) reject(err);
      let obj = JSON.parse(data);
      if (obj[id]) {
        resolve(obj[id]);
      } else {
        resolve("No such test found");
      }
    });
  });
}
module.exports = { getTests, getTestById };
