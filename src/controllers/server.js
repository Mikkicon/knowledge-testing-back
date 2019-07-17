"use strict";

const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const {
  initDB,
  getUsers,
  getUser,
  addUser,
  removeUser,
  login
} = require("../models/dbManager");
const app = express();

async function isAuthorised(req, res, next) {
  console.log("Authorizing");
  next();
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.all("/users/:id", isAuthorised);

app.get("/", (req, res) => {
  res.sendFile("./index.html", { root: __dirname });
});

app.get("/users/:id", (req, res) => {
  console.log("Id: ", req.params.id);
  getUser(req.params.id, (err, result) => {
    if (err) {
      console.log(err);
      res.status(400).send(err);
    } else {
      res.status(200).send(result);
    }
  });
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
app.post("/login", (req, res) => {
  login(req.body, (err, result) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(result);
    }
  });
});
app.post("/tests", (req, res) => {
  console.log(req.body);
});

app.get("/tests", (req, res) => {
  fs.readFile("../../tests.json", "utf8", function(err, data) {
    if (err) throw err;
    let testList = JSON.parse(data);
    if (
      "page" in req.query &&
      req.query.page >= 0 &&
      req.query.page * 10 < testList.length
    ) {
      let tests = testList.slice(req.query.page * 10, req.query.page * 10 + 10);
      let pageAmount =
        ~~(testList.length / 10) + Math.sign(testList.length % 10);
      res.status(200).send(JSON.stringify({ pageAmount, tests }));
    } else {
      res.status(200).send(testList);
    }
  });
});
app.get("/image", (req, res) => {
  res.sendFile("/Users/mp/Desktop/cpp.jpg");
});
app.get("/tests/:id", (req, res) => {
  fs.readFile("./tests.json", "utf8", function(err, data) {
    if (err) throw err;
    let obj = JSON.parse(data);
    if (obj[req.params.id]) {
      res.status(200).send(obj[req.params.id]);
    } else {
      res.status(400).send("No such test found");
    }
  });
});

app.get("/register", (req, res) => {
  res.sendFile("./register.html", { root: __dirname });
});
app.post("/register", (req, res) => {
  addUser(req.body, (err, result) => {
    if (err) {
      console.log("ERROR");
      res.status(400).send(err);
    } else {
      console.log("NO ERROR");
      res.status(200).send(result);
    }
  });
});

(async () => {
  console.log("Starting server");
  await initDB({ user: "root", password: "rootbeer", db: "knowledgeTesting" });
  app.listen(3000, "localhost", () => console.log("Listening"));
})();
