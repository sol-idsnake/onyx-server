const express = require("express");
const mongoose = require("mongoose");
const { User, Base, BaseUser } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/list", (req, res) => {
	Base.find()
		.then(bases => res.json(bases.map(base => base.serialize())))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.get("/single/:id", (req, res) => {
	Base.findById(req.params.id)
		.then(base => res.json(base.serialize()))
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
	console.log(req.body);
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
