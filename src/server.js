"use strict";

const { cors, express, bodyParser } = require("./utils/modulesManager");
const { getTests, getTestById } = require("./modules/services/tests.service");
const {
  getUserById,
  registerUser,
  loginUser
} = require("./modules/services/auth.service");
const { initDB } = require("./utils/db.util");
const { PORT } = require("./constants");
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function isAuthorised(req, res, next) {
  console.log("Authorizing");
  next();
}
app.all("/users/:id", isAuthorised);

app.get("/users/:id", (req, res) => {
  console.log("Id: ", req.params.id);
  getUserById(req.params.id).then(e => console.log("E: ", e));
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

app.get("/users/", async (req, res) => {
  getUsers((err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});

app.post("/login", async (req, res) => {
  try {
    let result = await loginUser(req.body);
    console.log(result);
    if (result) {
      res.status(200).send(JSON.stringify({ token: result }));
    } else {
      res.status(400).send("Wrong credentials");
    }
  } catch (error) {
    res.status(400).send("err");
  }
});
app.post("/tests", (req, res) => {
  console.log(req.body);
});

app.get("/tests", async (req, res) => {
  let tests = await getTests(req.query);
  if (tests) {
    res.status(200).send(tests);
  } else {
    res.status(400).send("Error");
  }
});

app.get("/tests/:id", async (req, res) => {
  let result = await getTestById(req.params.id);
  if (!result) {
    res.status(400).send("err");
  } else {
    res.status(200).send(result);
  }
});

app.post("/register", async (req, res) => {
  try {
    let result = await registerUser(req.body.mail);
    console.log(result);
    result ? res.status(200).send(result) : res.status(400).send("err");
  } catch (error) {
    res.status(400).send("err");
  }
});

app.post("/user/:login", (req, res) => {
  console.log("Req login: ", req.params.login);
  console.log("Req body: ", req.body);
  res.status(200).send("Success");
});

(async () => {
  console.log("Starting server");
  await initDB({
    user: "root",
    password: "rootbeer",
    db: "knowledgeTesting"
  });
  app.listen(PORT, "localhost", () => console.log("Listening"));
})();
