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

function isUserInDB(mail) {
  console.log("Mail in isUserInDB: ", mail);

  return new Promise((resolve, reject) => {
    con.query(`SELECT mail FROM users WHERE mail = '${mail}'`, (err, res) => {
      if (err) {
        reject(err);
      } else if (res && res.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

async function getUser(mail, callback) {
  const sql = `SELECT login, mail, password FROM users WHERE mail='${mail}'`;
  try {
    const isIn = await isUserInDB(mail);
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
function addUser({ login: login, mail: mail, password: password }) {
  return new Promise(async (resolve, reject) => {
    const sql = `INSERT INTO users SET ?`;
    const isIn = await isUserInDB(mail);

    if (isIn) {
      reject(`Login ${login} is already occupied.`);
    } else {
      con.query(sql, { login, mail, password }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          console.log("[ addUser ] Success: ", res);
          resolve(res);
        }
      });
    }
  });
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
function getUserByMail(id) {
  return new Promise((resolve, reject) => {
    getUser(id, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
module.exports = {
  getUsers,
  getUser,
  addUser,
  removeUser,
  login,
  initDB,
  isUserInDB,
  getUserByMail
};
