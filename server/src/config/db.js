const mongoose = require('mongoose');

/**
 * Cached connection object — reused across serverless warm invocations
 * and across multiple calls within the same process.
 */
const cached = {
  conn: null,
  promise: null,
};

/**
 * Connects to MongoDB using a cached connection strategy that is safe
 * for both traditional long-running servers and serverless environments.
 *
 * @returns {Promise<mongoose.Connection>} The active Mongoose connection.
 */
async function connectDB() {
  // Return existing connection immediately if available
  if (cached.conn) {
    return cached.conn;
  }

  // Create the connection promise only once
  if (!cached.promise) {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined.');
    }

    cached.promise = mongoose
      .connect(MONGO_URI, {
        // Disable Mongoose's internal command buffering — in serverless
        // environments we control connection timing ourselves.
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('MongoDB connected successfully.');
        return mongooseInstance.connection;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };
