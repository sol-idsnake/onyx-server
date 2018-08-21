const express = require("express");
const mongoose = require("mongoose");
const { User, Base, UserBaseSchema } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/:id", (req, res) => {
	Base.findById(req.params.id)
		// .then(base => {
		// 	res.json(() => bases.serialize());
		// })
		.then(message => res.json(message.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "Internal server error" });
		});
});

// router.post("/add", jwtAuth, (req, res) => {
router.post("/:id/user", (req, res) => {
	const id = req.body.baseId;
	const update = { $push: { userList: req.body.userName } };

	Base.findByIdAndUpdate(id, update, { new: true })
		// .then(res => res.status(204).end())
		.then(base => res.json(base.serialize()))
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.post("/:id/message", (req, res) => {
	const id = req.body.baseId;
	const update = { $push: { messages: req.body.message } };

	Base.findByIdAndUpdate(id, update, { new: true })
		.then(message => res.json(message.serialize()))
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.delete("/delete", (req, res) => {
	Base.findByIdAndRemove(req.body.id)
		.then(() => {
			console.log(`Deleted post with ID \`${req.body.id}\``);
			res.status(204).end();
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;
