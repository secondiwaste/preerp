const fs = require('fs').promises;
const path = require('path');
const { pool } = require('./database');

class MigrationRunner {
  constructor(migrationsDir) {
    this.migrationsDir = migrationsDir;
    // Lazy load Logger to avoid circular dependency
    this.Logger = null;
  }

  // Get Logger instance (lazy loading)
  getLogger() {
    if (!this.Logger) {
      this.Logger = require('../utils/logger');
    }
    return this.Logger;
  }

  // Create migrations tracking table
  async createMigrationsTable() {
    const connection = await pool.getConnection();
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          version VARCHAR(255) NOT NULL UNIQUE,
          description VARCHAR(500),
          script_name VARCHAR(255) NOT NULL,
          checksum VARCHAR(64),
          installed_by VARCHAR(100) DEFAULT 'system',
          installed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          execution_time INT,
          success BOOLEAN DEFAULT TRUE,
          INDEX idx_version (version)
        )
      `);
      await this.getLogger().info('MIGRATIONS', 'Schema migrations table ready', { consoleOnly: true });
    } finally {
      connection.release();
    }
  }

  // Parse migration filename (e.g., V1__create_users_table.sql)
  parseMigrationFile(filename) {
    const match = filename.match(/^V(\d+)__([\w_]+)\.sql$/);
    if (!match) return null;
    
    return {
      version: match[1],
      description: match[2].replace(/_/g, ' '),
      filename: filename
    };
  }

  // Calculate checksum for migration file
  calculateChecksum(content) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  // Get list of migration files sorted by version
  async getMigrationFiles() {
    try {
      const files = await fs.readdir(this.migrationsDir);
      const migrations = files
        .map(file => this.parseMigrationFile(file))
        .filter(m => m !== null)
        .sort((a, b) => parseInt(a.version) - parseInt(b.version));
      
      return migrations;
    } catch (error) {
      if (error.code === 'ENOENT') {
        await this.getLogger().info('MIGRATIONS', 'Migrations directory not found, creating...', { consoleOnly: true });
        await fs.mkdir(this.migrationsDir, { recursive: true });
        return [];
      }
      throw error;
    }
  }

  // Get applied migrations from database
  async getAppliedMigrations() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT version, checksum FROM schema_migrations WHERE success = TRUE ORDER BY version'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Check if migration has been applied
  async isMigrationApplied(version) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT id FROM schema_migrations WHERE version = ? AND success = TRUE',
        [version]
      );
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  // Execute a single migration
  async executeMigration(migration) {
    const filePath = path.join(this.migrationsDir, migration.filename);
    const content = await fs.readFile(filePath, 'utf8');
    const checksum = this.calculateChecksum(content);
    
    const connection = await pool.getConnection();
    const startTime = Date.now();
    
    try {
      // Start transaction
      await connection.beginTransaction();
      
      // Execute migration SQL
      await this.getLogger().info('MIGRATIONS', `Executing V${migration.version}: ${migration.description}`, { consoleOnly: true });
      
      // Remove comment lines and split by semicolons
      const cleanContent = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => !line.startsWith('--') && line.length > 0)
        .join('\n');
      
      const statements = cleanContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      await this.getLogger().debug('MIGRATIONS', `Found ${statements.length} SQL statement(s) to execute`, { consoleOnly: true });
      
      for (const statement of statements) {
        if (statement) {
          await this.getLogger().debug('MIGRATIONS', `Executing: ${statement.substring(0, 60)}...`, { consoleOnly: true });
          await connection.query(statement);
        }
      }
      
      const executionTime = Date.now() - startTime;
      
      // Record migration
      await connection.query(
        `INSERT INTO schema_migrations 
         (version, description, script_name, checksum, execution_time, success) 
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [migration.version, migration.description, migration.filename, checksum, executionTime]
      );
      
      await connection.commit();
      await this.getLogger().success('MIGRATIONS', `V${migration.version} applied successfully (${executionTime}ms)`, { consoleOnly: true });
      return true;
    } catch (error) {
      await connection.rollback();
      
      // Record failed migration
      try {
        await connection.query(
          `INSERT INTO schema_migrations 
           (version, description, script_name, checksum, success) 
           VALUES (?, ?, ?, ?, FALSE)`,
          [migration.version, migration.description, migration.filename, checksum]
        );
      } catch (recordError) {
        await this.getLogger().error('MIGRATIONS', `Failed to record migration failure: ${recordError.message}`, { consoleOnly: true });
      }
      
      await this.getLogger().error('MIGRATIONS', `V${migration.version} failed: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
      throw error;
    } finally {
      connection.release();
    }
  }

  // Validate checksums of applied migrations
  async validateMigrations() {
    await this.getLogger().debug('MIGRATIONS', 'Validating migration checksums...', { consoleOnly: true });
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationFiles = await this.getMigrationFiles();
    
    for (const applied of appliedMigrations) {
      const migrationFile = migrationFiles.find(m => m.version === applied.version);
      
      if (!migrationFile) {
        await this.getLogger().warn('MIGRATIONS', `Applied migration V${applied.version} not found in migrations directory`, { consoleOnly: true });
        continue;
      }
      
      const filePath = path.join(this.migrationsDir, migrationFile.filename);
      const content = await fs.readFile(filePath, 'utf8');
      const checksum = this.calculateChecksum(content);
      
      if (checksum !== applied.checksum) {
        throw new Error(
          `Migration checksum mismatch for V${applied.version}! ` +
          `The migration file has been modified after it was applied. ` +
          `This is not allowed as it can lead to inconsistent database states.`
        );
      }
    }
    
    await this.getLogger().info('MIGRATIONS', 'All checksums validated', { consoleOnly: true });
  }

  // Run all pending migrations
  async migrate() {
    try {
      await this.getLogger().info('MIGRATIONS', 'Starting database migration...', { consoleOnly: true });
      
      // Ensure migrations table exists
      await this.createMigrationsTable();
      
      // Get all migration files
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        await this.getLogger().info('MIGRATIONS', 'No migration files found', { consoleOnly: true });
        return;
      }
      
      await this.getLogger().info('MIGRATIONS', `Found ${migrationFiles.length} migration(s)`, { consoleOnly: true });
      
      // Validate existing migrations
      await this.validateMigrations();
      
      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      const appliedVersions = new Set(appliedMigrations.map(m => m.version));
      
      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        m => !appliedVersions.has(m.version)
      );
      
      if (pendingMigrations.length === 0) {
        await this.getLogger().info('MIGRATIONS', 'Database is up to date', { consoleOnly: true });
        return;
      }
      
      await this.getLogger().info('MIGRATIONS', `Found ${pendingMigrations.length} pending migration(s)`, { consoleOnly: true });
      
      // Execute pending migrations in order
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      await this.getLogger().success('MIGRATIONS', 'All migrations completed successfully', { consoleOnly: true });
    } catch (error) {
      await this.getLogger().error('MIGRATIONS', `Migration failed: ${error.message}`, { consoleOnly: true, metadata: { stack: error.stack } });
      throw error;
    }
  }

  // Get migration status
  async getStatus() {
    await this.createMigrationsTable();
    
    const migrationFiles = await this.getMigrationFiles();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    
    console.log('\n[MIGRATIONS] Migration Status:');
    console.log('='.repeat(80));
    
    for (const migration of migrationFiles) {
      const status = appliedVersions.has(migration.version) ? '[APPLIED]' : '[PENDING]';
      console.log(`V${migration.version.padEnd(3)} | ${status.padEnd(10)} | ${migration.description}`);
    }
    
    console.log('='.repeat(80));
    console.log(`Total: ${migrationFiles.length} | Applied: ${appliedMigrations.length} | Pending: ${migrationFiles.length - appliedMigrations.length}\n`);
  }
}

module.exports = MigrationRunner;
