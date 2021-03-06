"use strict";

const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../users/models");
const { JWT_SECRET, TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe("Auth endpoints", function() {
  const username = "exampleUser";
  const password = "examplePass";
  const firstName = "Example";
  const lastName = "User";
  const email = "test@email.com";

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return User.hashPassword(password).then(password =>
      User.create({
        username,
        password,
        firstName,
        lastName,
        email
      })
    );
  });

  afterEach(function() {
    return User.remove({});
  });

  describe("/auth/login", function() {
    it("Should reject requests with no credentials", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .then(res => {
          expect(res).to.have.status(400);
        });
    });
    it("Should reject requests with incorrect usernames", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username: "wrongUsername", password })
        .then(res => {
          expect(res).to.have.status(401);
        });
    });
    it("Should reject requests with incorrect passwords", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username, password: "wrongPassword" })
        .then(res => {
          expect(res).to.have.status(401);
        });
    });
    it("Should return a valid auth token", function() {
      return chai
        .request(app)
        .post("/auth/login")
        .send({ username, password })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          const token = res.body.authToken;
          expect(token).to.be.a("string");
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm: ["HS256"]
          });
        });
    });

    describe("/api/auth/refresh", function() {
      it("Should reject requests with no credentials", function() {
        return chai
          .request(app)
          .post("/auth/refresh")
          .then(res => {
            expect(res).to.have.status(401);
          });
      });
      it("Should reject requests with an invalid token", function() {
        const token = jwt.sign(
          {
            username,
            firstName,
            lastName,
            email
          },
          "wrongSecret",
          {
            algorithm: "HS256",
            expiresIn: "7d"
          }
        );
        return chai
          .request(app)
          .post("/auth/refresh")
          .set("Authorization", `Bearer ${token}`)
          .then(res => {
            expect(res).to.have.status(401);
          });
      });
      it("Should return a valid auth token with a newer expiry date", function() {
        const token = jwt.sign(
          {
            user: {
              username,
              firstName,
              lastName,
              email
            }
          },
          JWT_SECRET,
          {
            algorithm: "HS256",
            subject: username,
            expiresIn: "3d"
          }
        );
        const decoded = jwt.decode(token);
        return chai
          .request(app)
          .post("/auth/refresh")
          .set("authorization", `Bearer ${token}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an("object");
            const token = res.body.authToken;
            expect(token).to.be.a("string");
            const payload = jwt.verify(token, JWT_SECRET, {
              algorithm: ["HS256"]
            });
            expect(payload.user).to.deep.equal({
              username,
              firstName,
              lastName,
              email
            });
            expect(payload.exp).to.be.at.least(decoded.exp);
          });
      });
    });
  });
});
