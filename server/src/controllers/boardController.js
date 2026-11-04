const Board = require('../models/Board');
const Task = require('../models/Task');

/**
 * GET /api/boards
 * Return all boards owned by the authenticated user, newest first.
 */
const getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: boards });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/boards
 * Create a new board owned by the authenticated user.
 */
const createBoard = async (req, res, next) => {
  try {
    const { title } = req.body;

    const board = await Board.create({ title, owner: req.user._id });
    return res.status(201).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/boards/:id
 * Update a board's title. Only the owner may update.
 */
const updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    board.title = req.body.title !== undefined ? req.body.title : board.title;
    await board.save();

    return res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/boards/:id
 * Delete a board and all of its tasks. Only the owner may delete.
 */
const deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) {
      return res.status(404).json({ success: false, message: 'Board not found.' });
    }

    // Cascade-delete all tasks that belong to this board
    await Task.deleteMany({ board: board._id });
    await board.deleteOne();

    return res.status(200).json({ success: true, message: 'Board and all its tasks have been deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getBoards, createBoard, updateBoard, deleteBoard };
