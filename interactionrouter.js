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

// router.post("/add", jwtAuth, (req, res) => {
router.post("/add", (req, res) => {
	Base.create({
		creatorId: req.body.userId,
		title: req.body.title,
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

module.exports = router;
