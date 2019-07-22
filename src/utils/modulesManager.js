const fs = require("fs");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

module.exports = { fs, cors, express, bodyParser, nodemailer, bcrypt, jwt };
