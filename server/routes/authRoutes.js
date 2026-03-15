const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validateMiddleware');

const registerSchema = {
    username: { required: true, minLength: 3 },
    email: { required: true, isEmail: true },
    password: { required: true, minLength: 6 }
};

const loginSchema = {
    identifier: { required: true },
    password: { required: true }
};

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, updateProfile);

module.exports = router;
