const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Board title is required.'],
    trim: true,
    minlength: [1, 'Board title must be at least 1 character.'],
    maxlength: [100, 'Board title must not exceed 100 characters.'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Board must have an owner.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Keep updatedAt current whenever the document is saved.
 */
boardSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Strip internal Mongoose field from JSON output.
 */
boardSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    return ret;
  },
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
