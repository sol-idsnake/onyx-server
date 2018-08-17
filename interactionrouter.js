const express = require("express");
const mongoose = require("mongoose");
const { User, Base } = require("./users/models");
const app = express();
const router = express.Router();
mongoose.Promise = global.Promise;

app.use(express.json());

router.get("/list", (req, res) => {
	Base.find()
		.then(bases => {
			res.json(bases.map(base => base.serialize()));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.get("/addUser/:id", (req, res) => {
	console.log(req);
	Base.findById(req.params.id)
		.then(messages => res.json(messages.serialize()))
		.then(res => console.log(res))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: "Internal server error" });
		});
});

// router.post("/add", jwtAuth, (req, res) => {
router.post("/add", (req, res) => {
	Base.create({
		creatorId: req.body.userId,
		title: req.body.title,
		currentUsers: 0,
		messages: 0
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
});

module.exports = router;
