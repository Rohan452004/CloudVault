const express = require('express');
const router = express.Router();
const { register, login, googleLogin, logout } = require('../controllers/authController');

// @route   POST /api/v1/auth/register
// @desc    Register user
router.post('/register', register);

// @route   POST /api/v1/auth/login
// @desc    Login user
router.post('/login', login);

// @route   POST /api/v1/auth/googlelogin
// @desc    Google OAuth login
router.post('/googlelogin', googleLogin);

// @route   POST /api/v1/auth/logout
// @desc    Logout user
router.post('/logout', logout);

module.exports = router; 