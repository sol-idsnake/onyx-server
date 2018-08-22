"use strict";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Schemas are the structure of the document
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  email: { type: String, default: "", required: true, unique: true }
});

const BaseSchema = mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  created: { type: Date, default: Date.now() }
});

const BaseUserSchema = mongoose.Schema({
  userId: { type: String },
  baseId: { type: mongoose.Schema.Types.ObjectId },
  created: { type: Date, default: Date.now() },
  acceptedMembership: { type: Boolean },
  isCreator: { type: Boolean }
});

BaseUserSchema.methods.serialize = function() {
  return {
    userId: this.userId,
    baseId: this.baseId,
    created: this.created,
    acceptedMembership: this.acceptedMembership,
    isCreator: this.isCreator
  };
};

UserSchema.methods.serialize = function() {
  return {
    userId: this._id,
    username: this.username || "",
    firstName: this.firstName || "",
    lastName: this.lastName || ""
  };
};

BaseSchema.methods.serialize = function() {
  return {
    id: this._id,
    creatorId: this.creatorId,
    title: this.title,
    created: this.created
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
const BaseUser = mongoose.model("BaseUser", BaseUserSchema);

module.exports = { User, Base, BaseUser };
