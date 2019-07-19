"use strict";

const { con } = require("./utils/db.util");
var bcrypt = require("bcryptjs");

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
      if (bcrypt.compareSync(res[0].password, pass)) {
        console.log("Correct pass: ", pass);
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
  getUsers,
  getUser,
  addUser,
  removeUser,
  login
};
