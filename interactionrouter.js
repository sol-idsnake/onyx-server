const express = require("express");
const mongoose = require("mongoose");
const { User } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.post("/add", (req, res) => {
	const username = req.body.username;
	console.log(username);
	// User.findOne({ username: username })
	// 	.then(res => console.log(res))
	// 	.then(res => res.status(201))
	// 	.catch(err => res.status(500).json({ message: "Internal server error" }));
	const query = { username: username };
	const update = { interactionVariables[bases.push(req.body.title)] };
	// User.findOneAndUpdate(query, update)
	// 	.then(res => console.log(res))
	// 	.then(res => res.status(201));
});

module.exports = router;

//   res.status(200).send(req.body);
//   // create user var
//   // find user
//   // push new user var into user.bases
//   // save user
// });
