"use strict";

const { cors, express, bodyParser } = require("./utils/modulesManager");
const {
  getTests,
  checkTestAnswers,
  getTestById,
  addTest
} = require("./modules/services/tests.service");
const {
  registerUser,
  loginUser,
  getFullUserInfo,
  changeCredentials,
  getUserInfo
} = require("./modules/services/auth.service");
const { initDB } = require("./utils/db.util");
const { PORT } = require("./constants");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// async function isAuthorised(req, res, next) {
//   console.log("Authorizing");
//   next();
// }
// app.all("/users/:id", isAuthorised);

// ----------------USER----------------

app.post("/users/info", async (req, res) => {
  console.log('app.get("/users/"');
  if (req.body.token) {
    let [userInfo] = await getUserInfo(req.body.token);
    res.send(userInfo);
  }
});

app.post("/users/", async (req, res) => {
  console.log('app.post("/users/:id", (req, res) => {');
  try {
    let result = await getFullUserInfo(req.body.token);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("err");
  }
});
app.put("/users/", async (req, res) => {
  console.log('app.put("/users/:id", (req, res) => {');

  try {
    let result = await changeCredentials(req.body.token, req.body);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("err");
  }
});
app.delete("/users/:id", (req, res) => {
  removeUser(req.params.id, (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

// ----------------AUTH----------------
app.post("/register", async (req, res) => {
  console.log('app.post("/register"');
  try {
    let result = await registerUser(req.body.mail);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send("err");
  }
});

app.post("/login", async (req, res) => {
  console.log('app.post("/login"');
  try {
    let { login, token } = await loginUser(req.body);
    if (token && login) {
      console.log(token, login);
      res.status(200).send(JSON.stringify({ login, token }));
    } else {
      res.status(400).send("Wrong credentials");
    }
  } catch (error) {
    res.status(400).send("err");
  }
});

// ----------------TESTS----------------
app.post("/tests/:id", async (req, res) => {
  console.log('app.post("/tests/:id"');
  try {
    let results = await checkTestAnswers(
      req.params.id,
      req.body.token,
      req.body.answers,
      req.body.time
    );
    if (results) {
      res.status(200).send(JSON.stringify({ correct: results }));
    } else {
      res.status(400).send("Error");
    }
  } catch (error) {
    res.status(400).send("Error");
  }
});

app.post("/tests", async (req, res) => {
  console.log('app.post("/tests"');
  try {
    // let result = await addTest(req.body);
    res.status(200).send("OK");
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/tests", async (req, res) => {
  console.log('app.get("/tests"');
  let tests = await getTests(req.query);
  if (tests) {
    res.status(200).send(tests);
  } else {
    res.status(400).send("Error");
  }
});

app.get("/tests/:id", async (req, res) => {
  console.log('app.get("/tests/:id"');
  let result = await getTestById(req.params.id);
  delete result["correct"];
  if (!result) {
    res.status(400).send("err");
  } else {
    res.status(200).send(result);
  }
});

// ----------------INIT DB + START SERVER----------------
(async () => {
  console.log("Starting server");
  await initDB({
    user: "root",
    password: "rootbeer",
    db: "knowledgeTesting"
  });
  app.listen(PORT);
})();
