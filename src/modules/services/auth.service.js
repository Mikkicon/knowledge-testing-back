const {
  getUserByMail,
  addUser,
  updateUser,
  getUserTests
} = require("../../utils/db.util");
const { MAIL_REGISTER_SUBJECT, TOKEN_PRIVATE_KEY } = require("../../constants");
const { nodemailer, bcrypt, jwt } = require("../../utils/modulesManager");
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
  to: null,
  subject: null,
  text: null
};

async function isAuthorized(mail, pass) {
  try {
    let [user] = await getUserByMail(mail);
    let correctPass = user.password;
    let comparePass = await bcrypt.compare(correctPass, pass);
    return comparePass;
  } catch (error) {
    return false;
  }
}

async function loginUser({ mail, pass }) {
  try {
    let isAuth = await isAuthorized(mail, pass);
    if (isAuth) {
      console.log("ISAUTH: ", isAuth);
      var token = jwt.sign({ userMail: mail }, TOKEN_PRIVATE_KEY);
      return mail, token;
    } else {
      console.log("No such user in DB");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

function isStringEmail(string) {
  let at = string.indexOf("@");
  return (
    at && string.substring(at).length > 3 && string.substring(0, at).length > 0
  );
}

async function registerUser(email) {
  let userPassword = [...Array(8)]
    .map(i => (~~(Math.random() * 36)).toString(36))
    .join("");
  mailOptions.to = email;
  mailOptions.subject = MAIL_REGISTER_SUBJECT;
  mailOptions.text = userPassword;
  let login = email.slice(0, email.indexOf("@") || email);
  try {
    let isUserAdded = await addUser({
      login,
      mail: email,
      password: userPassword
    });
    let isMailSent = isStringEmail(email) && (await sendMail(mailOptions));
    console.log("Registring...");
    let result = isUserAdded && isMailSent;
    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

function sendMail(mailOptions) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        reject(error);
        console.log("This is undefined: ", error);
      } else {
        console.log(info);
        resolve("Sent.");
      }
    });
  });
}

function validateCredentials(body) {
  let { mail, pass, oldpass } = body;
  return oldpass && ((mail && isStringEmail(mail)) || pass);
}

async function changeCredentials(oldMail, body) {
  let { mail, pass, oldpass } = body;
  let updateParams = {};
  if (validateCredentials(body)) {
    let isAuth = await isAuthorized(oldMail, oldpass);
    if (!isAuth) return false;
    if (mail) updateParams["mail"] = mail;
    if (pass) updateParams["pass"] = pass;
    let result = await updateUser(oldMail, updateParams);
    return result;
  } else {
    return "Error";
  }
}

async function getFullUserInfo(token) {
  const verifiedToken = jwt.verify(token, TOKEN_PRIVATE_KEY);
  console.log(verifiedToken);
  if (typeof verifiedToken === "object") {
    const userInfo = await getUserTests(verifiedToken.userMail);
    return userInfo;
  }
  return "JWT wasn't verified";
}

module.exports = {
  getUserByMail,
  loginUser,
  registerUser,
  transporter,
  mailOptions,
  changeCredentials,
  getFullUserInfo
};
