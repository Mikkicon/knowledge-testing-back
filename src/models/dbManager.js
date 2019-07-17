"use strict";

var mysql = require("mysql");
var con = null;

async function initDB({ user: user, password: password, db: db }) {
  console.log("Connecting");
  if (!db) {
    throw "NO DB SPECIFIED";
  } else {
    con = await mysql.createConnection({
      host: "localhost",
      user: user,
      password: password,
      database: db
    });
    con.query(`CREATE DATABASE IF NOT EXISTS ${db}`, (err, res) => {
      if (err) throw err;
    });
    con.query(
      "CREATE TABLE IF NOT EXISTS users (login VARCHAR(255) PRIMARY KEY, mail VARCHAR(255), password VARCHAR(512))",
      (err, res) => {
        if (err) throw err;
      }
    );
    con.query(
      "CREATE TABLE IF NOT EXISTS tests (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))",
      (err, res) => {
        if (err) throw err;
      }
    );
    con.query("DELETE FROM users WHERE login='testLogin'", (err, res) => {
      if (err) throw err;
    });
    con.query(
      "INSERT INTO users (login,mail,password) VALUES ('testLogin','testMail','testPass')",
      (err, res) => {
        if (err) throw err;
      }
    );
  }
}

function getUsers(callback) {
  let sql = "SELECT login, mail FROM users";
  con.query(sql, (err, res) => {
    if (err) callback(err, null);
    console.log("In 'getUsers()', result: ", res);
    callback(null, res);
  });
}

function isUserInDB(id) {
  return new Promise((resolve, reject) => {
    con.query(
      `SELECT login, mail FROM users WHERE  login = '${id}'`,
      (err, res) => {
        if (err) return reject(err);
        resolve(res && res.length);
      }
    );
  });
}

async function getUser(login, callback) {
  const sql = `SELECT login, mail FROM users WHERE login='${login}'`;
  try {
    const isIn = await isUserInDB(login);
    if (isIn) {
      con.query(sql, (err, result) => {
        if (err) callback(err, null);
        callback(null, result);
      });
    } else {
      callback("No user in DB", null);
    }
  } catch (e) {
    console.log(e);
  }
}

async function addUser(
  { login: login, mail: mail, password: password },
  callback
) {
  const sql = `INSERT INTO users SET ?`;
  try {
    const isIn = await isUserInDB(login);
    if (isIn) {
      callback(`Login ${login} is already occupied.`, null);
    } else {
      con.query(sql, { login, mail, password }, (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          console.log("[ addUser ] Success: ", res);
          callback(null, res);
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
}

function removeUser(login, callback) {
  con.query(`SELECT * FROM users WHERE login = ?`, login, (err, res) => {
    if (err) callback(err, null);
    if (res && res.length) {
      console.log(`User ${login} found: `, res);
      con.query(`DELETE FROM users WHERE login = ?`, login, (err, res) => {
        if (err) callback(err, null);
        console.log(res);
        callback(null, res);
      });
    } else {
      callback(`No ${login} in dataBase`, null);
    }
  });
}

function login({ mail: mail, pass: pass }, callback) {
  con.query(`SELECT * FROM users WHERE mail = ?`, mail, (err, res) => {
    if (res && res.length) {
      console.log("Found user: ", res[0]);
      if (pass === res[0].password) {
        console.log("Correct pass");
        callback(null, res[0]);
      } else {
        console.log("Incorrect pass.");
        callback("Incorrect pass.", null);
      }
    } else {
      callback("No such user", null);
    }
  });
}

module.exports = {
  initDB,
  getUsers,
  getUser,
  addUser,
  removeUser,
  login
};
