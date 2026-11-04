const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Express middleware that enforces JWT authentication.
 *
 * Reads the token from the `Authorization: Bearer <token>` header,
 * verifies it, looks up the corresponding user, and attaches the full
 * user document (minus password) to `req.user`.
 *
 * Responds with 401 on any failure so that downstream controllers can
 * assume `req.user` is always a valid, existing user object.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Ensure the header exists and is in the expected format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    // Verify signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Fetch the user so we always have fresh data and can detect deleted accounts
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect };
