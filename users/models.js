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
  created: { type: Date, default: Date.now() },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "BaseUser" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }]
});

const BaseUserSchema = mongoose.Schema({
  userId: { type: String },
  baseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base" },
  created: { type: Date, default: Date.now() },
  acceptedMembership: { type: Boolean, default: false },
  isCreator: { type: Boolean, default: false }
});

const MessageSchema = mongoose.Schema({
  baseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Base" },
  content: { type: String, required: true },
  created: { type: Date, default: Date.now(), required: true }
});

BaseSchema.methods.serialize = function() {
  return {
    id: this._id,
    creatorId: this.creatorId,
    title: this.title,
    created: this.created,
    users: this.users,
    messages: this.messages
  };
};

BaseUserSchema.methods.serialize = function() {
  return {
    acceptedMembership: this.acceptedMembership,
    baseId: this.baseId,
    created: this.created,
    id: this._id,
    isCreator: this.isCreator,
    userId: this.userId
  };
};

MessageSchema.methods.serialize = function() {
  return {
    baseId: this.baseId,
    content: this.content,
    created: this.created,
    id: this._id
  };
};

UserSchema.methods.serialize = function() {
  return {
    userId: this._id,
    username: this.username || "",
    firstName: this.firstName || "",
    lastName: this.lastName || "",
    email: this.email || ""
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
const Message = mongoose.model("Message", MessageSchema);

module.exports = { User, Base, BaseUser, Message };
