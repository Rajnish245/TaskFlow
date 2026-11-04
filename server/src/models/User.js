const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters.'],
    maxlength: [50, 'Name must not exceed 50 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address.'],
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: [6, 'Password must be at least 6 characters.'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Hash the password before saving if it has been modified.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Compare a plain-text candidate password against the stored hash.
 *
 * @param {string} candidatePassword - The plain-text password to test.
 * @returns {Promise<boolean>} True if the passwords match.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove sensitive / internal fields from JSON serialisation.
 */
userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
