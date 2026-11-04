const express = require('express');
const { body } = require('express-validator');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');

const router = express.Router();

// All task routes require authentication
router.use(protect);

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

const createTaskValidators = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters.'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters.'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High.'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be todo, in-progress, or done.'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO 8601 date.'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('order must be a number.'),
];

const updateTaskValidators = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Task title must be between 1 and 200 characters.'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters.'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High.'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'done'])
    .withMessage('Status must be todo, in-progress, or done.'),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO 8601 date.'),
  body('order')
    .optional()
    .isNumeric()
    .withMessage('order must be a number.'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET    /api/boards/:boardId/tasks */
router.get('/boards/:boardId/tasks', getTasks);

/** POST   /api/boards/:boardId/tasks */
router.post('/boards/:boardId/tasks', createTaskValidators, validate, createTask);

/** PUT    /api/tasks/:id */
router.put('/tasks/:id', updateTaskValidators, validate, updateTask);

/** DELETE /api/tasks/:id */
router.delete('/tasks/:id', deleteTask);

module.exports = router;
