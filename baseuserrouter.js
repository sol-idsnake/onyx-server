const express = require("express");
const mongoose = require("mongoose");
const { BaseUser } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/list/:id", (req, res) => {
	if (req.params.id === "generic") {
		BaseUser.find()
			.then(users => res.json(users.map(user => user.serialize())))
			.catch(err => {
				console.error(err);
				res.status(500).json({ message: "Internal server error" });
			});
	} else {
		BaseUser.find({ baseId: req.params.id })
			.then(users => res.json(users.map(user => user.serialize())))
			.catch(err => {
				console.error(err);
				res.status(500).json({ message: "Internal server error" });
			});
	}
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

router.put("/modify", (req, res) => {
	if (req.body.target === "acceptedMembership") {
		return BaseUser.findOneAndUpdate(
			{ userId: req.body.email },
			{ acceptedMembership: req.body.bool },
			{ new: true }
		)
			.then(baseUser => res.json(baseUser.serialize()))
			.then(res => res.status(204).end())
			.catch(err => res.status(500).json({ message: "Internal server error" }));
	}
});

module.exports = router;
