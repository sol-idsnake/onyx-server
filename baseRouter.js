const express = require("express");
// const mongoose = require("mongoose");
const { Base, BaseUser, Message } = require("./users/models");
const app = express();
const router = express.Router();
const passport = require("passport");
// mongoose.Promise = global.Promise;

app.use(express.json());
const jwtAuth = passport.authenticate("jwt", { session: false });
// Dashcontent fetches all bases created by the current User

// Todo: also fetch 'count' information via mongoose about userlist- & message length
// 				return it via one object. see --> baseuserrouter, completeObject concept
router.get("/list/:id", jwtAuth, (req, res) => {
	// async function fetcher() {
	// 	try {
	// 		const bases = await Base.find({ creatorId: req.params.id });
	// 		const baseUserPromises = bases.map(base =>
	// 			BaseUser.find({ baseId: base._id })
	// 		);
	// 		return await Promise.all(baseUserPromises);
	// 	} catch (err) {
	// 		console.error(err);
	// 		res.status(500).json({ message: "Internal server error" });
	// 	}
	// 	// finally {
	// 	// 	console.log("trigger");
	// 	// }
	// }
	// fetcher().then(data => console.log(data));

	Base.find({ creatorId: req.params.id })
		// .then(bases => {
		// 	for (let base of bases) {
		// 		let completeObject = {
		// 			base: {},
		// 			users: BaseUser.find({ creatorId: base._id }.countDocuments()),
		// 			messages: ""
		// 		};
		// 		completeObject.base = base.serialize();
		// 	}
		// })
		// completeObjectArray = []
		// .then(bases => {
		// 	bases.forEach(base => {
		// 		completeObject = {
		// 			base: base,
		// 			users:
		// 		}
		// 	})
		// })

		.then(bases => res.json(bases.map(base => base.serialize())))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

/////////////////////////////////
// Fetch single base, to include members and messages
/////////////////////////////////
router.get("/single-base/:id", jwtAuth, (req, res) => {
	let completeObject = {
		base: {},
		users: [],
		messages: []
	};

	Base.findById(req.params.id)
		.then(data => {
			completeObject.base = data;
			return data;
		})
		.then(data => {
			BaseUser.find({ baseId: req.params.id })
				.then(data => {
					completeObject.users = data.map(item => item.serialize());
					return data;
				})
				.then(data => {
					Message.find({ baseId: req.params.id }).then(data => {
						completeObject.messages = data.map(item => item.serialize());
						return res.json(completeObject);
					});
				});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		});
});

router.post("/add", jwtAuth, (req, res) => {
	Base.create({
		creatorId: req.body.userId,
		title: req.body.title
	})
		.then(post => res.status(201).json(post.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: "Internal server error" });
		})
		.then(() =>
			Base.find({ title: req.body.title }).then(data => {
				return data.map(item => {
					BaseUser.create({
						userId: req.body.username,
						baseId: item._id,
						created: Date.now(),
						acceptedMembership: true,
						isCreator: true
					});
				});
			})
		);
});

router.delete("/delete", jwtAuth, (req, res) => {
	Base.findByIdAndDelete(req.body.id)
		.then(() => {
			console.log(`Deleted base with ID \`${req.body.id}\``);
			res.status(204).end();
		})
		.then(() => {
			BaseUser.deleteMany({ baseId: req.body.id })
				.then(() => {
					console.log(`All users from list with ID ${req.body.id} deleted`);
					res.status(204).end();
				})
				.then(() => {
					Message.deleteMany({ baseId: req.body.id }).then(() => {
						console.log(`All users from list with ID ${req.body.id} deleted`);
						res.status(204).end();
					});
				})
				.catch(err =>
					res.status(500).json({ message: "Internal server error" })
				);
		});
});

module.exports = router;
