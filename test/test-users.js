"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../users");
const { TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("/api/user", function() {
  const username = "exampleUser";
  const password = "examplePass";
  const firstName = "Example";
  const lastName = "User";
  const email = "test@email.com";
  const userId = "12345";
  const usernameB = "exampleUserB";
  const passwordB = "examplePassB";
  const firstNameB = "ExampleB";
  const lastNameB = "UserB";
  const emailB = "test@email.comB";
  const userIdB = "12345B";

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  afterEach(function() {
    return User.remove({});
  });

  describe("/register", function() {
    describe("POST", function() {
      it("Should reject users with missing username", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            password,
            firstName,
            lastName,
            email
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal("Missing field");
            expect(res.body.location).to.equal("username");
          });
      });
      it("Should reject users with missing password", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal("Missing field");
            expect(res.body.location).to.equal("password");
          });
      });
      it("Should reject users with non-string username", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username: 1234,
            password,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Incorrect field type: expected string"
            );
            expect(res.body.location).to.equal("username");
          });
      });
      it("Should reject users with non-string password", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password: 1234,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Incorrect field type: expected string"
            );
            expect(res.body.location).to.equal("password");
          });
      });
      it("Should reject users with non-string first name", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password,
            firstName: 1234,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Incorrect field type: expected string"
            );
            expect(res.body.location).to.equal("firstName");
          });
      });
      it("Should reject users with non-string last name", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password,
            firstName,
            lastName: 1234,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Incorrect field type: expected string"
            );
            expect(res.body.location).to.equal("lastName");
          });
      });
      it("Should reject users with non-trimmed username", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Cannot start or end with whitespace"
            );
            expect(res.body.location).to.equal("username");
          });
      });
      it("Should reject users with non-trimmed password", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Cannot start or end with whitespace"
            );
            expect(res.body.location).to.equal("password");
          });
      });
      it("Should reject users with empty username", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username: "",
            password,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Must be at least 3 characters long"
            );
            expect(res.body.location).to.equal("username");
          });
      });
      it("Should reject users with password less than ten characters", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password: "123456789",
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Must be at least 10 characters long"
            );
            expect(res.body.location).to.equal("password");
          });
      });
      it("Should reject users with password greater than 72 characters", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password: new Array(73).fill("a").join(""),
            firstName,
            lastName,
            userId,
            email
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal(
              "Must be at most 72 characters long"
            );
            expect(res.body.location).to.equal("password");
          });
      });
      it("Should reject users with duplicate username", function() {
        // Create an initial user
        return User.create({
          username,
          password,
          firstName,
          lastName,
          email,
          userId
        })
          .then(() =>
            // Try to create a second user with the same username
            chai
              .request(app)
              .post("/register")
              .send({
                username,
                password,
                firstName,
                lastName,
                email,
                userId
              })
          )
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal("ValidationError");
            expect(res.body.message).to.equal("Username already taken");
            expect(res.body.location).to.equal("username");
          });
      });
      it("Should create a new user", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            username,
            password,
            firstName,
            lastName,
            email,
            userId
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(
              "username",
              "firstName",
              "lastName",
              "email",
              "userId"
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            expect(res.body.email).to.equal(email);
            expect(res.body.userId).to.equal(res.body.userId);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            expect(user.email).to.equal(email);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it("Should trim firstName and lastName", function() {
        return chai
          .request(app)
          .post("/register")
          .send({
            email,
            username,
            password,
            firstName: ` ${firstName} `,
            lastName: ` ${lastName} `,
            userId
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an("object");
            expect(res.body).to.have.keys(
              "username",
              "firstName",
              "lastName",
              "email",
              "userId"
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            expect(res.body.email).to.equal(email);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            expect(user.email).to.equal(email);
          });
      });
    });
  });
});
