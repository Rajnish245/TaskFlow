const express = require('express');
const { body } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

const registerValidators = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
];

const loginValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** POST /api/auth/register */
router.post('/register', authLimiter, registerValidators, validate, register);

/** POST /api/auth/login */
router.post('/login', authLimiter, loginValidators, validate, login);

/** GET /api/auth/me */
router.get('/me', protect, me);

module.exports = router;
