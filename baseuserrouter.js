const express = require("express");
const mongoose = require("mongoose");
const { BaseUser, Base, Message } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/foreignbases/:username", (req, res) => {
	const userId = req.params.username.toLowerCase();
	BaseUser.find({ userId })
		.then(baseusers => {
			let basefetches = [];
			for (let baseuser of baseusers) {
				basefetches.push(Base.findById(baseuser.baseId));
			}

			return Promise.all(basefetches).then(bases => {
				const completeObjects = [];
				for (let i = 0; i < baseusers.length; i++) {
					completeObject = {
						base: bases[i].serialize(),
						baseuser: baseusers[i].serialize()
					};
					completeObjects.push(completeObject);
				}
				res.json(completeObjects);
			});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.post("/addUser", (req, res) => {
	BaseUser.create({
		userId: req.body.userName.toLowerCase(),
		baseId: req.body.baseId,
		created: Date.now()
	})
		.then(user => res.json(user.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.delete("/userDelete/:baseId", (req, res) => {
	BaseUser.findOneAndDelete({
		baseId: req.params.baseId,
		userId: { $eq: req.body.userId }
	})
		.then(() => {
			console.log(`Deleted user with ID \`${req.body.userId}\``);
			res.status(204).end();
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.put("/modify", (req, res) => {
	BaseUser.findOneAndUpdate(
		{ baseId: req.body.baseId },
		{ acceptedMembership: req.body.bool },
		{ new: true }
	)
		.then(baseUser => res.json(baseUser.serialize()))
		.then(res => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

// 4 CRUD Ops to add messages
router.post("/messageAdd", (req, res) => {
	Message.create({
		baseId: req.body.baseId,
		content: req.body.content,
		created: Date.now()
	})
		.then(message => res.json(message.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.delete("/deleteMsg/:id", (req, res) => {
	Message.findByIdAndRemove(req.params.id)
		.then(() => {
			console.log(`Deleted message with ID \`${req.params.id}\``);
			res.status(204).end();
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;
