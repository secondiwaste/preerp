# Database Migrations

This directory contains database migration scripts using a Flyway-style versioning system.

## Migration Naming Convention

Migrations follow the pattern: `V{version}__{description}.sql`

Examples:
- `V1__create_users_table.sql`
- `V2__create_sessions_table.sql`
- `V3__add_email_to_users.sql`

**Rules:**
- Version numbers must be sequential integers (V1, V2, V3...)
- Use double underscore `__` to separate version from description
- Description should use underscores for spaces
- All migrations must have `.sql` extension
- Once applied, migrations should **NEVER** be modified

## How It Works

1. **Automatic Execution**: Migrations run automatically when the server starts
2. **Tracking**: Applied migrations are tracked in the `schema_migrations` table
3. **Checksum Validation**: System validates that applied migrations haven't been modified
4. **Transaction Safety**: Each migration runs in a transaction (rolls back on failure)
5. **Sequential Order**: Migrations execute in version order (V1 → V2 → V3...)

## Migration Table Structure

The `schema_migrations` table tracks all migrations:

```sql
CREATE TABLE schema_migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(255) NOT NULL UNIQUE,
  description VARCHAR(500),
  script_name VARCHAR(255) NOT NULL,
  checksum VARCHAR(64),
  installed_by VARCHAR(100) DEFAULT 'system',
  installed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  execution_time INT,
  success BOOLEAN DEFAULT TRUE
);
```

## Creating New Migrations

1. **Determine the next version number**
   - Check existing files in this directory
   - Use the next sequential number

2. **Create the migration file**
   ```bash
   # Example: Adding a new column
   V3__add_email_to_users.sql
   ```

3. **Write the SQL**
   ```sql
   -- Add email column to users table
   ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
   ```

4. **Restart the server**
   - Migration will run automatically on startup
   - Check logs for success/failure

## Best Practices

### ✅ DO:
- Keep migrations small and focused
- Test migrations on development database first
- Use descriptive names
- Add comments explaining what the migration does
- Use `IF NOT EXISTS` for CREATE statements where possible
- Include rollback instructions in comments

### ❌ DON'T:
- Modify an applied migration (create a new one instead)
- Delete migration files
- Skip version numbers
- Use database-specific features that aren't portable
- Include data that varies between environments

## Example Migration

```sql
-- V4__create_products_table.sql
-- Description: Add products table for inventory management
-- Rollback: DROP TABLE products;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sku (sku)
);
```

## Troubleshooting

### Migration Failed
1. Check server logs for error details
2. Migration marked as failed in `schema_migrations`
3. Fix the issue in the migration file
4. Delete the failed entry from `schema_migrations`:
   ```sql
   DELETE FROM schema_migrations WHERE version = 'X' AND success = FALSE;
   ```
5. Restart server to retry

### Checksum Mismatch
- **Error**: "Migration checksum mismatch"
- **Cause**: Migration file was modified after being applied
- **Solution**: Never modify applied migrations. Create a new migration instead

### Multiple Servers
When running multiple instances:
- Migrations use database locks (via transactions)
- Only one server will execute pending migrations
- Others will skip already-applied migrations

## Viewing Migration Status

To see which migrations have been applied:

```sql
SELECT version, description, installed_on, execution_time, success
FROM schema_migrations
ORDER BY version;
```

## Manual Rollback

Migrations don't auto-rollback. To revert:

1. Create a new migration that reverses changes
2. Example: if V3 adds a column, create V4 to drop it:
   ```sql
   -- V4__remove_email_from_users.sql
   ALTER TABLE users DROP COLUMN email;
   ```

## Version Control

- ✅ Commit all migration files to Git
- ✅ Include migrations in pull requests
- ✅ Review migrations carefully in code review
- ✅ Document breaking changes in PR description
