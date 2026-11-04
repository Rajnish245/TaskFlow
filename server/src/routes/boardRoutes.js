const express = require('express');
const { body } = require('express-validator');
const {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All board routes require authentication
router.use(protect);

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

const boardTitleValidator = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board title must be between 1 and 100 characters.'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET  /api/boards */
router.get('/', getBoards);

/** POST /api/boards */
router.post('/', boardTitleValidator, validate, createBoard);

/** PUT  /api/boards/:id */
router.put('/:id', boardTitleValidator, validate, updateBoard);

/** DELETE /api/boards/:id */
router.delete('/:id', deleteBoard);

module.exports = router;
