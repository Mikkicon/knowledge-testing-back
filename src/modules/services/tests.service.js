const { fs } = require("../../utils/modulesManager");
const { bcrypt, jwt } = require("../../utils/modulesManager");
const { TOKEN_PRIVATE_KEY } = require("../../constants");
const { addUserTest } = require("../../utils/db.util");
function getTests(query) {
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
function getTestById(id) {
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
async function recordNewTestCompletion(testId, token, amountCorrect, time) {
  const decoded = await jwt.decode(token, TOKEN_PRIVATE_KEY);
  addUserTest(decoded.userMail, testId, amountCorrect, time);
}
async function checkTestAnswers(testId, token, userAnswers, time) {
  try {
    const test = await getTestById(testId);
    const correctAnswers = test["correct"];
    userAnswers = userAnswers.filter(
      (answer, index) => answer === correctAnswers[index]
    );
    const amountCorrect = userAnswers.length.toString();
    token && recordNewTestCompletion(testId, token, amountCorrect, time);
    return Promise.resolve(amountCorrect);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = { getTests, getTestById, checkTestAnswers };
