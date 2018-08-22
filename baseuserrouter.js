const express = require("express");
const mongoose = require("mongoose");
const { BaseUser } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/list", (req, res) => {
	BaseUser.find()
		.then(users => res.json(users.map(user => user.serialize())))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.post("/addUser", (req, res) => {
	BaseUser.findOne({ baseId: req.body.baseId })
		.then(function(res) {
			if (res === null) {
				return BaseUser.create({
					userId: req.body.userName,
					baseId: req.body.baseId,
					created: Date.now(),
					acceptedMembership: true,
					isCreator: true
				});
			} else {
				return BaseUser.create({
					userId: req.body.userName,
					baseId: req.body.baseId,
					created: Date.now(),
					acceptedMembership: false,
					isCreator: false
				});
			}
		})
		.then(user => res.json(user.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

module.exports = router;
