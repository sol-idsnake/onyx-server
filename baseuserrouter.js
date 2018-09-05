const express = require("express");
const mongoose = require("mongoose");
const { BaseUser, Base, Message } = require("./users/models");
const app = express();
const router = express.Router();
const passport = require("passport");
const jwtAuth = passport.authenticate("jwt", { session: false });
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/foreignbases/:username", jwtAuth, (req, res) => {
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

router.post("/addUser", jwtAuth, (req, res) => {
	BaseUser.create({
		userId: req.body.userName.toLowerCase(),
		baseId: req.body.baseId,
		created: Date.now()
	})
		.then(user => {
			Base.findById(req.body.baseId).then(base => {
				base.users.push(user);
				return base.save();
			});
			res.json(user.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.delete("/userDelete/", jwtAuth, (req, res) => {
	let completeObject = {
		base: {},
		baseuser: {}
	};

	BaseUser.findOneAndDelete({
		baseId: req.body.baseId,
		userId: { $eq: req.body.username }
	})
		.then(data => {
			console.log(data);
			completeObject.baseuser = data;
			return data;
		})
		.then(data => {
			Base.findById(data.baseId).then(base => {
				base.users.filter(user => user !== data._id);
				base.save();

				console.log(base);
				completeObject.base = base;
				console.log(completeObject);
				return res
					.json(completeObject)
					.status(204)
					.end();
			});
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

router.put("/modify", jwtAuth, (req, res) => {
	BaseUser.findOneAndUpdate(
		{ baseId: req.body.baseId, userId: { $eq: req.body.username } },
		{ acceptedMembership: req.body.bool },
		{ new: true }
	)
		.then(baseUser => res.json(baseUser.serialize()))
		.then(res => res.status(204).end())
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

// 4 CRUD Ops to add messages
router.post("/messageAdd", jwtAuth, (req, res) => {
	Message.create({
		baseId: req.body.baseId,
		content: req.body.content,
		created: Date.now()
	})
		.then(message => {
			Base.findById(req.body.baseId).then(base => {
				base.messages.push(message);
				return base.save();
			});
			res.json(message.serialize());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.delete("/deleteMsg/:id", jwtAuth, (req, res) => {
	console.log(req.params.id);
	Message.findByIdAndRemove(req.params.id)
		.then(data => {
			console.log(data);
			Base.findById(data.baseId).then(base => {
				base.messages.filter(message => message !== data._id);
			});
		})
		.then(() => {
			console.log(`Deleted message with ID \`${req.params.id}\``);
			return res
				.json(req.params.id)
				.status(204)
				.end();
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));
});

module.exports = router;
