const express = require('express');
const path = require('path');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const Session = require('./models/Session');
const Logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const configRoutes = require('./routes/configRoutes');
const logsRoutes = require('./routes/logsRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api', protectedRoutes);

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../frontend/dist/preerp/browser')));

// Handle Angular routing - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/preerp/browser/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error('SERVER', `Unhandled error: ${err.message}`, { consoleOnly: true, metadata: { stack: err.stack } });
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    // Set up session cleanup interval (every hour)
    setInterval(async () => {
      try {
        await Session.cleanupExpired();
      } catch (error) {
        await Logger.error('SERVER', `Failed to cleanup expired sessions: ${error.message}`, { consoleOnly: true });
      }
    }, 60 * 60 * 1000); // Run every hour
    
    // Run initial cleanup
    await Session.cleanupExpired();
    
    app.listen(PORT, () => {
      Logger.info('SERVER', `Server is running on http://localhost:${PORT}`, { consoleOnly: true });
      Logger.info('SERVER', `Environment: ${process.env.NODE_ENV}`, { consoleOnly: true });
      Logger.info('SERVER', `Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { consoleOnly: true });
      Logger.info('SERVER', 'Session cleanup scheduled every hour', { consoleOnly: true });
    });
  } catch (error) {
    Logger.error('SERVER', `Failed to start server: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
    process.exit(1);
  }
}

startServer();
