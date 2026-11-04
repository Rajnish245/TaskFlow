const Board = require('../models/Board');
const Task = require('../models/Task');

/**
 * Verify that a board exists and is owned by the requesting user.
 * Returns the board document, or null if the check fails.
 */
async function verifyBoardOwnership(boardId, userId) {
  return Board.findOne({ _id: boardId, owner: userId });
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

/**
 * GET /api/boards/:boardId/tasks
 * Fetch all tasks for a board owned by the current user.
 *
 * Supported query params:
 *   status   — filter by exact status value
 *   priority — filter by exact priority value
 *   search   — case-insensitive substring match on title
 *   sort     — "dueDate_asc" | "dueDate_desc"
 *   (default sort: order ASC, then createdAt ASC)
 */
const getTasks = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const { status, priority, search, sort } = req.query;

    // Confirm ownership of the parent board
    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    // Build query filter
    const filter = { board: boardId, owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    // Build sort order
    let sortOrder = { order: 1, createdAt: 1 }; // default
    if (sort === 'dueDate_asc') sortOrder = { dueDate: 1 };
    if (sort === 'dueDate_desc') sortOrder = { dueDate: -1 };

    const tasks = await Task.find(filter).sort(sortOrder);
    return res.status(200).json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/boards/:boardId/tasks
 * Create a new task on a board owned by the current user.
 */
const createTask = async (req, res, next) => {
  try {
    const { boardId } = req.params;

    const board = await verifyBoardOwnership(boardId, req.user._id);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    const { title, description, priority, status, dueDate, order } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate: dueDate || null,
      order: order !== undefined ? order : 0,
      board: boardId,
      owner: req.user._id,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/tasks/:id
 * Update allowed fields on a task owned by the current user.
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    // Only update fields that were explicitly provided in the request body
    const allowedFields = ['title', 'description', 'priority', 'status', 'dueDate', 'order'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/tasks/:id
 * Permanently delete a task owned by the current user.
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await task.deleteOne();
    return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
