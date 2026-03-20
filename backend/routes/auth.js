// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getChannel } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, uploadAvatar.single('avatar'), updateProfile);
router.get('/channel/:userId', getChannel);

module.exports = router;
