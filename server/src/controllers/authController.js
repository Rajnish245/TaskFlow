const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/**
 * Sign a JWT for the given user ID.
 *
 * @param {string} id - The user's MongoDB ObjectId as a string.
 * @returns {string} Signed JWT.
 */
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Build the standard auth response payload.
 *
 * @param {object} user - Mongoose User document.
 * @returns {{ _id, name, email }}
 */
function formatUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * Create a new user account.
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check for existing account
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate an existing user and return a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select the password field which is excluded by default
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: formatUser(user),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 * req.user is already populated (minus password) by the protect middleware.
 */
const me = (req, res) => {
  return res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
};

module.exports = { register, login, me };
