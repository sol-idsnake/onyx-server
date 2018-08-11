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
  interactionVariables: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserVariables" }],
});

const UserVariables = mongoose.Schema({
  bases: [{ type: "String", required: true, default: "" }],
  users: [{ type: String, default: "" }],
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || "",
    firstName: this.firstName || "",
    lastName: this.lastName || "",
  };
};

UserVariables.methods.serialize = function() {
  return {
    bases: this.bases || "",
    users: this.users || "",
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const UserVariable = mongoose.model("UserVariable", UserVariables);
const User = mongoose.model("User", UserSchema);

module.exports = { User, UserVariable };
