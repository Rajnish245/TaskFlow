const express = require('express');
const { body } = require('express-validator');
const { breakdown } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * POST /api/ai/breakdown
 * Break a user-supplied goal into AI-generated subtasks.
 */
router.post(
  '/breakdown',
  protect,
  aiLimiter,
  [
    body('goal')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage('Goal must be between 1 and 500 characters.'),
  ],
  validate,
  breakdown
);

module.exports = router;
