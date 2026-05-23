const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Build connection config conditionally
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'preerp_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Only include password if it's set and not empty
if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.trim() !== '') {
  connectionConfig.password = process.env.DB_PASSWORD;
}

const pool = mysql.createPool(connectionConfig);

// Function to initialize database and run migrations
async function initializeDatabase() {
  // Import Logger here to avoid circular dependency
  const Logger = require('../utils/logger');
  
  try {
    // Test database connection
    const connection = await pool.getConnection();
    await Logger.success('DATABASE', 'Database connection established', { consoleOnly: true });
    connection.release();
    
    // Run migrations
    const MigrationRunner = require('./migrations');
    const migrationsDir = path.join(__dirname, '../../migrations');
    const migrationRunner = new MigrationRunner(migrationsDir);
    
    await migrationRunner.migrate();
    
    await Logger.success('DATABASE', 'Database initialized successfully', { consoleOnly: true });
  } catch (error) {
    await Logger.error('DATABASE', `Error initializing database: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
    throw error;
  }
}

module.exports = { pool, initializeDatabase };
