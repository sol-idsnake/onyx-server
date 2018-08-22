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
	BaseUser.create({
		userId: req.body.userName,
		baseId: req.body.baseId,
		created: Date.now(),
		acceptedMembership: req.body.acceptedMembership || false,
		isCreator: req.body.isCreator || false
	})
		.then(user => res.json(user.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

module.exports = router;
