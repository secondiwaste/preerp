const express = require('express');
const path = require('path');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const Session = require('./models/Session');
const Log = require('./models/Log');
const Logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const configRoutes = require('./routes/configRoutes');
const logsRoutes = require('./routes/logsRoutes');
const projectRoutes = require('./routes/projectRoutes');
const betonozasiNaploRoutes = require('./routes/betonozasiNaploRoutes');
const raktarRoutes = require('./routes/raktarRoutes');
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
app.use('/api/project', projectRoutes);
app.use('/api/betonozasi-naplo', betonozasiNaploRoutes);
app.use('/api/raktar', raktarRoutes);
app.use('/api', protectedRoutes);

// Serve static files from Angular build
app.use(express.static(path.join(__dirname, '../frontend/dist/preerp/browser')));

// Handle Angular routing - serve index.html for all non-API routes
app.get('*', (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
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
    
    // Helper function for log cleanup
    const logRetentionDays = parseInt(process.env.LOG_RETENTION_DAYS) || 90;
    const cleanupLogs = async () => {
      try {
        const deletedCount = await Log.deleteOlderThan(logRetentionDays);
        if (deletedCount > 0) {
          Logger.info('SERVER', `Cleaned up ${deletedCount} old log entries`);
        }
      } catch (error) {
        await Logger.error('SERVER', `Failed to cleanup old logs: ${error.message}`);
      }
    };
    
    // Set up log cleanup interval (once per day)
    setInterval(cleanupLogs, 24 * 60 * 60 * 1000); // Run once per day
    
    // Run initial cleanup
    await Session.cleanupExpired();
    await cleanupLogs();
    
    app.listen(PORT, () => {
      Logger.info('SERVER', `Server is running on http://localhost:${PORT}`, { consoleOnly: true });
      Logger.info('SERVER', `Environment: ${process.env.NODE_ENV}`, { consoleOnly: true });
      Logger.info('SERVER', `Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { consoleOnly: true });
      Logger.info('SERVER', 'Session cleanup scheduled every hour', { consoleOnly: true });
      Logger.info('SERVER', `Log cleanup scheduled daily (retention: ${logRetentionDays} days)`, { consoleOnly: true });
    });
  } catch (error) {
    Logger.error('SERVER', `Failed to start server: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
    process.exit(1);
  }
}

startServer();
