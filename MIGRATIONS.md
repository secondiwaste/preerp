# Database Migrations - Quick Reference

## What Changed

✅ **Flyway-style migration system implemented**
- CREATE TABLE statements moved from code to SQL files
- Automatic migration tracking in `schema_migrations` table
- Checksum validation prevents accidental modifications
- Transaction-safe execution with automatic rollback on failure

## Migration Files

Existing migrations:
- `migrations/V1__create_users_table.sql` - Users table
- `migrations/V2__create_sessions_table.sql` - Sessions/tokens table

## How Migrations Work

1. **Server starts** → Runs pending migrations automatically
2. **Migrations table** → Tracks what's been applied
3. **Checksums** → Validates files haven't been modified
4. **Ordered execution** → Runs in version order (V1 → V2 → V3...)

## Commands

```bash
# Check migration status
npm run migration:status

# Start server (runs migrations automatically)
npm start
```

## Creating New Migrations

### Step 1: Determine Version Number
Check `migrations/` directory for the latest version, then use next number.

### Step 2: Create File
```bash
# Format: V{number}__{description}.sql
migrations/V3__add_email_to_users.sql
```

### Step 3: Write SQL
```sql
-- Add email column to users
ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
```

### Step 4: Restart Server
Migrations run automatically on startup.

## Important Rules

### ✅ DO
- Create new migrations for schema changes
- Test on development first
- Use descriptive names
- Add comments explaining changes

### ❌ DON'T
- **Never modify applied migrations** (create new one instead)
- Delete migration files
- Skip version numbers
- Include environment-specific data

## Example: Adding a Column

**File:** `migrations/V3__add_user_role.sql`
```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' NOT NULL;
CREATE INDEX idx_role ON users(role);
```

## Example: Creating a Table

**File:** `migrations/V4__create_products.sql`
```sql
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Migration Failed
1. Check server logs for error
2. Find failed entry: `SELECT * FROM schema_migrations WHERE success = FALSE;`
3. Fix the SQL in migration file
4. Delete failed entry: `DELETE FROM schema_migrations WHERE version = 'X' AND success = FALSE;`
5. Restart server

### Checksum Mismatch Error
**Cause:** Applied migration file was modified  
**Solution:** Never modify applied migrations. Create a new migration to make changes.

### View Applied Migrations
```sql
SELECT version, description, installed_on, execution_time 
FROM schema_migrations 
ORDER BY version;
```

## Production Deployment

1. Commit migration files to Git
2. Deploy code with migrations
3. Server automatically runs pending migrations on startup
4. Check logs to confirm success

## Full Documentation

See [migrations/README.md](migrations/README.md) for complete documentation.
