/**
 * routes/auth.js - Authentication Routes
 *
 * WHAT: Maps HTTP verbs + paths to authController functions.
 * WHY:  Keeps route declarations thin — no business logic lives here.
 */

const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
