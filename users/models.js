"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Schemas are the structure of the document
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
});

const BaseSchema = mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
});

UserSchema.methods.serialize = function() {
  return {
    userId: this._id,
    username: this.username || "",
    firstName: this.firstName || "",
    lastName: this.lastName || "",
  };
};

BaseSchema.methods.serialize = function() {
  return {
    creatorId: this.creatorId,
    title: this.title,
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const Base = mongoose.model("Base", BaseSchema);
const User = mongoose.model("User", UserSchema);

module.exports = { User, Base };
