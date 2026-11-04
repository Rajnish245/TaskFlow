const rateLimit = require('express-rate-limit');

/**
 * generalLimiter — applied globally to all routes.
 * Allows up to 100 requests per 15-minute window per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate-limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

/**
 * authLimiter — applied specifically to authentication routes.
 * Stricter limit: 20 requests per 15 minutes to slow brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

/**
 * aiLimiter — applied to AI-powered routes.
 * Conservative limit: 10 requests per 15 minutes to control upstream API costs.
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again after 15 minutes.',
  },
});

module.exports = { generalLimiter, authLimiter, aiLimiter };
