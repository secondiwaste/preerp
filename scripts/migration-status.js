#!/usr/bin/env node

/**
 * Migration Status Script
 * 
 * Shows the current status of all database migrations
 * 
 * Usage:
 *   node scripts/migration-status.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { pool } = require('../server/config/database');
const MigrationRunner = require('../server/config/migrations');

async function showStatus() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationRunner = new MigrationRunner(migrationsDir);
    
    await migrationRunner.getStatus();
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

showStatus();
