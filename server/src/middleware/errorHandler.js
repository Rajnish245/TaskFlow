/**
 * errorHandler — central Express error-handling middleware.
 *
 * Must be registered as the LAST middleware in src/app.js so that all
 * errors forwarded via `next(err)` land here.
 */
const errorHandler = (err, req, res, next) => {
  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error.';

  // ----- Mongoose: bad ObjectId -----
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Resource not found.';
  }

  // ----- Mongoose: schema validation failure -----
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect human-readable messages from every failing field
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(' ');
  }

  // ----- Mongoose: unique-index violation -----
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {}).join(', ');
    message = field
      ? `Duplicate field value: ${field} already exists.`
      : 'Duplicate field value.';
  }

  // ----- JWT errors -----
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token has expired.' : 'Invalid token.';
  }

  const payload = {
    success: false,
    message,
  };

  // Include stack trace in development to aid debugging
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = errorHandler;
