const express = require("express");
const mongoose = require("mongoose");
const { BaseUser, Base } = require("./users/models");
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

router.delete("/userDelete", (req, res) => {
	BaseUser.findOneAndDelete({ created: req.body.timeStamp })
		.then(data => res.json(data.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.put("/modify", (req, res) => {
	BaseUser.findOneAndUpdate(
		{ baseId: req.body.baseId },
		// { acceptedMembership: false },
		{ acceptedMembership: req.body.bool },
		{ new: true }
	)
		.then(baseUser => res.json(baseUser.serialize()))
		.then(res => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;
