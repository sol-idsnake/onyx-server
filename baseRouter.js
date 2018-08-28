const express = require("express");
// const mongoose = require("mongoose");
const { Base, BaseUser } = require("./users/models");
const app = express();
const router = express.Router();
// mongoose.Promise = global.Promise;

app.use(express.json());

// Dashcontent fetches all bases created by the current User
router.get("/list/:id", (req, res) => {
	Base.find({ creatorId: req.params.id })
		.then(bases => res.json(bases.map(base => base.serialize())))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

/////////////////////////////////
// Fetch single base, to include members and messages
/////////////////////////////////
router.get("/single-base/:id", (req, res) => {
	Base.findOne({ _id: req.params.id })
		.then(base => {
			// let basefetches = [];

			return BaseUser.find({ baseId: base.id }).then(users =>
				res.json(users.map(user => user.serialize()))
			);

			// return Promise.all(basefetches).then(users => console.log(users));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.post("/add", (req, res) => {
	Base.create({
		creatorId: req.body.userId,
		title: req.body.title,
		currentUsers: [],
		messages: []
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.delete("/delete", (req, res) => {
	Base.findByIdAndRemove(req.body.id)
		.then(() => {
			console.log(`Deleted post with ID \`${req.body.id}\``);
			res.status(204).end();
		})
		.catch(err => res.status(500).json({ message: "Internal server error" }));

	BaseUser.find({ baseId: req.body.id })
		.remove()
		.then(() => {
			console.log(`All userlists with ID ${req.body.id} deleted`);
			res.status(204).end();
		});
});

module.exports = router;
