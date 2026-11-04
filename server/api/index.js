require('dotenv').config();
const { connectDB } = require('../src/config/db');
const app = require('../src/app');

// Track connection state across warm invocations in serverless
let isConnected = false;

/**
 * Vercel serverless entry-point.
 * Ensures the DB connection is established before forwarding
 * the request to the Express app.
 */
module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
};
