const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ---------------------------------------------------------------------------
// Security & parsing middleware
// ---------------------------------------------------------------------------

// Set a comprehensive set of security-related HTTP headers
app.use(helmet());

// Enable CORS for the configured front-end origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Global rate limiting
// ---------------------------------------------------------------------------

app.use(generalLimiter);

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// API routes
// ---------------------------------------------------------------------------

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

// Task routes contain paths like /api/boards/:boardId/tasks AND /api/tasks/:id
// so we mount them at /api to let the router handle the full sub-paths.
app.use('/api', taskRoutes);

app.use('/api/ai', aiRoutes);

// ---------------------------------------------------------------------------
// 404 handler — catch requests to unknown routes
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ---------------------------------------------------------------------------
// Central error handler — must be last
// ---------------------------------------------------------------------------

app.use(errorHandler);

module.exports = app;
