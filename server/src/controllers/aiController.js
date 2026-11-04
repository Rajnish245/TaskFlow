const { generateSubtasks } = require('../services/aiService');

/**
 * POST /api/ai/breakdown
 * Accept a high-level goal and return an AI-generated list of subtasks.
 *
 * Body:
 *   goal {string} — 1–500 characters, pre-validated by express-validator.
 *
 * Responses:
 *   200 { success: true, subtasks: [...] }
 *   429 { success: false, message: "AI is busy..." }   ← upstream rate limit
 *   500 (via errorHandler) for unexpected failures
 */
const breakdown = async (req, res, next) => {
  try {
    const { goal } = req.body;

    const result = await generateSubtasks(goal);

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    // Translate our typed upstream-rate-limit error into a 429 response
    if (err.message === 'AI_RATE_LIMITED') {
      return res.status(429).json({
        success: false,
        message: 'AI is busy, please try again in a minute.',
      });
    }

    // Delegate everything else to the central error handler
    next(err);
  }
};

module.exports = { breakdown };
