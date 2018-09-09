const chai = require("chai");
const chaiHttp = require("chai-http");

const { app } = require("./server");

const should = chai.should();
chai.use(chaiHttp);

describe("API", function() {
	// let token;
	// before(function(done) {
	// 	request
	// 		.post("/dashboard")
	// 		.send({
	// 			username: "tester1",
	// 			password: "testtesttest"
	// 		})
	// 		.end(function(err, res) {
	// 			if (err) throw err;
	// 			token = { access_token: res.body.token };
	// 			done();
	// 		});
	// });

	it("should 200 on GET requests", function() {
		return chai
			.request(app)
			.get("/test")
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
			});
	});
});
