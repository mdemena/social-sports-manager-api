const express = require('express');
const UserController = require('../controllers/user.controller');
const uploadCloud = require('../configs/cloudinary.config.js');
const router = express.Router();

router.get('/', async (req, res, next) => {
	try {
		const users = await UserController.list();
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json(err);
	}
});
router.get('/:id', async (req, res, next) => {
	try {
		const user = await UserController.get(req.params.id);
		res.status(200).json(user);
	} catch (err) {
		res.status(500).json(err);
	}
});
router.put('/', uploadCloud.single('imageAvatar'), async (req, res, next) => {
	if (req.isAuthenticated()) {
		const user = {
			_id: req.user._id,
			username: req.body.username,
			name: req.body.name,
			email: req.body.email,
		};
		let foundUser = await UserController.existUsernameDifferentUser(
			user.username,
			user._id
		);
		if (foundUser) {
			res.status(400).json({ message: 'Usuari existent. Utilitza un altre.' });
			return;
		} else {
			foundUser = await UserController.existEmailDifferentUser(
				user.email,
				user._id
			);
			if (foundUser) {
				res
					.status(400)
					.json({ message: 'Correu existent. Utilitza un altre.' });
				return;
			} else {
				try {
					if (req.file) {
						user['image'] = req.file.path;
					}
					const editUser = await UserController.set(user);

					res.status(200).json(editUser);
				} catch (err) {
					res.status(500).json(err);
				}
			}
		}
	} else {
		res.status(500).json({ message: 'No estàs autenticat' });
	}
});
router.patch(
	'/upload/',
	uploadCloud.single('image'),
	async (req, res, next) => {
		if (req.isAuthenticated()) {
			try {
				if (req.file) {
					const editUser = await UserController.setImage(
						req.user._id,
						req.file.path
					);

					res.status(200).json(editUser);
				}
			} catch (err) {
				res.status(500).json(err);
			}
		} else {
			res.status(500).json({ message: 'No estàs autenticat' });
		}
	}
);
router.post('/checkemail', async (req, res, next) => {
	try {
		let exist = await UserController.existEmailDifferentUser(
			req.body.email,
			req.user._id
		);
		if (exist) {
			res.status(200).json(exist);
		} else {
			res.status(404).json({ message: 'Correu no registrat' });
		}
	} catch (err) {
		res.status(500).json(err);
	}
});
router.post('/checkusername', async (req, res, next) => {
	try {
		let exist = await UserController.existUsernameDifferentUser(
			req.body.username,
			req.user._id
		);
		if (exist) {
			res.status(200).json(exist);
		} else {
			res.status(404).json({ message: 'Usuari disponible' });
		}
	} catch (err) {
		res.status(500).json(err);
	}
});
module.exports = router;
