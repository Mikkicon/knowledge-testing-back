"use strict";

const { cors, express, bodyParser } = require("./utils/modulesManager");
const { getTests, getTestById } = require("./modules/services/tests.service");
const { getUserById } = require("./modules/services/auth.service");
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

app.post("/email", function(req, res) {
  var transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "unitestsbot@gmail.com",
      pass: "uniTestRootBeer"
    }
  });

  var mailOptions = {
    from: "unitestsbot@gmail.com",
    to: [req.body.to],
    subject: "Welcome on UniTest!",
    text: "Thank you."
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("This is undefined: ", error);
    } else {
      console.log(info);
      res.send("success!");
    }
  });
});

app.post("/login", async (req, res) => {
  // let result = await login(req.body);
  // if (!result) {
  //   res.status(400).send("err");
  // } else {
  //   res.status(200).send(result);
  // }
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
  // let result = await addUser(req.body);
  // if (!result) {
  //   console.log("ERROR");
  //   res.status(400).send("err");
  // } else {
  //   console.log("NO ERROR");
  //   res.status(200).send(result);
  // }
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
