const express = require("express");
const mongoose = require("mongoose");
const { User, Base, BaseUser } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

module.exports = router;
