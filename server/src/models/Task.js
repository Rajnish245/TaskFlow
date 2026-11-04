const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      minlength: [1, 'Task title must be at least 1 character.'],
      maxlength: [200, 'Task title must not exceed 200 characters.'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description must not exceed 1000 characters.'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High.',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be todo, in-progress, or done.',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Task must belong to a board.'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have an owner.'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically manage createdAt and updatedAt
    timestamps: true,
  }
);

// Compound index for efficient per-board status queries
taskSchema.index({ board: 1, status: 1 });

/**
 * Strip the internal Mongoose version key from JSON output.
 */
taskSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
