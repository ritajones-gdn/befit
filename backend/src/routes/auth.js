const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

// ─── VALIDATION RULES ───────────────────────────────────────

const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3 to 30 characters'),

  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
];

const loginRules = [
  body('email')
    .isEmail()
    .withMessage('Valid email required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// ─── ROUTES ─────────────────────────────────────────────────

// POST /auth/register
router.post('/register', registerRules, register);

// POST /auth/login
router.post('/login', loginRules, login);

module.exports = router;