# User Levels System

## Overview

The application implements a hierarchical user level system to control access to frontend pages and backend endpoints.

## User Levels

The system supports three levels of users, in hierarchical order:

1. **user** (Level 1) - Default level for new registrations
   - Basic access to protected routes
   - Can view their own dashboard

2. **moderator** (Level 2) - Elevated privileges
   - All user permissions
   - Access to moderator-specific endpoints
   - Can perform content moderation tasks

3. **administrator** (Level 3) - Highest privileges
   - All moderator permissions
   - Full system access
   - Can manage users and change user levels
   - Access to admin-only endpoints

## Backend Implementation

### Middleware

#### `requireRole(requiredRole)`
Check if user has at least the required role level.

```javascript
const { requireRole } = require('./middleware/requireRole');

// Require at least moderator level
router.get('/moderator/dashboard', authMiddleware, requireRole('moderator'), handler);
```

#### `requireAdmin`
Shorthand for `requireRole('administrator')`.

```javascript
const { requireAdmin } = require('./middleware/requireRole');

router.get('/admin/users', authMiddleware, requireAdmin, handler);
```

#### `requireModerator`
Shorthand for `requireRole('moderator')`.

```javascript
const { requireModerator } = require('./middleware/requireRole');

router.get('/moderator/content', authMiddleware, requireModerator, handler);
```

### Protected Routes Examples

```javascript
// Basic protected route - requires authentication only
router.get('/dashboard', authMiddleware, handler);

// Moderator or admin required
router.get('/moderator/dashboard', authMiddleware, requireModerator, handler);

// Admin only
router.get('/admin/users', authMiddleware, requireAdmin, handler);
router.put('/admin/users/:userId/level', authMiddleware, requireAdmin, handler);
```

### User Model Methods

```javascript
// Create user with specific level (defaults to 'user')
await User.create(username, password, 'administrator');

// Update user level (admin only)
await User.updateUserLevel(userId, 'moderator');

// Find user (includes user_level in response)
const user = await User.findById(userId);
// Returns: { id, username, user_level, created_at }
```

## Frontend Implementation

### Auth Service Methods

```typescript
// Check if user has required role
authService.hasRole('administrator') // returns boolean

// Convenience methods
authService.isAdmin() // returns boolean
authService.isModerator() // returns boolean

// Get current user level
authService.getUserLevel() // returns 'user', 'moderator', or 'administrator'
```

### Route Guards

```typescript
import { adminGuard, moderatorGuard, roleGuard } from './guards/role.guard';

// Admin only route
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}

// Moderator or higher
{
  path: 'moderator',
  component: ModeratorComponent,
  canActivate: [moderatorGuard]
}

// Custom role check
{
  path: 'custom',
  component: CustomComponent,
  canActivate: [roleGuard('moderator')]
}
```

### Component Usage

```typescript
export class DashboardComponent {
  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModerator(): boolean {
    return this.authService.isModerator();
  }
}
```

```html
<!-- Conditional display based on role -->
<div *ngIf="isAdmin">
  <h2>Admin Panel</h2>
  <!-- Admin-only content -->
</div>

<button *ngIf="isModerator || isAdmin">Moderate Content</button>
```

## Database Schema

### Migration: V3__add_user_level.sql

```sql
ALTER TABLE users 
ADD COLUMN user_level VARCHAR(50) NOT NULL DEFAULT 'user';

CREATE INDEX idx_user_level ON users(user_level);
```

### Sessions Table

JWT tokens include user_level in payload:
```json
{
  "id": 1,
  "username": "admin",
  "user_level": "administrator",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Register new user (defaults to 'user' level)
- `POST /api/auth/login` - Login (returns user with user_level)

### Protected Endpoints (Authentication Required)
- `GET /api/dashboard` - Basic dashboard (all authenticated users)
- `POST /api/auth/logout` - Logout (all authenticated users)
- `GET /api/auth/profile` - Get profile (all authenticated users)

### Moderator Endpoints (Moderator or Administrator)
- `GET /api/moderator/dashboard` - Moderator dashboard

### Admin Endpoints (Administrator Only)
- `GET /api/admin/users` - List all users with levels
- `PUT /api/admin/users/:userId/level` - Update user level
  - Body: `{ "user_level": "user" | "moderator" | "administrator" }`

## Error Messages

### Insufficient Privileges (403)
```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges."
}
```

**Translations:**
- English: "Access denied. Insufficient privileges."
- Hungarian: "Hozzáférés megtagadva. Nincs megfelelő jogosultság."

## Testing

### Create Admin User
```sql
-- Via SQL (for initial setup)
UPDATE users SET user_level = 'administrator' WHERE username = 'admin';
```

### Via Admin Endpoint
```javascript
// PUT /api/admin/users/2/level
// Headers: Authorization: Bearer <admin-token>
{
  "user_level": "moderator"
}
```

## Security Considerations

1. **Default Level**: New users always start as 'user' level
2. **JWT Inclusion**: User level is encoded in JWT token (no database query on each request)
3. **Token Refresh**: User must re-login after level change to get updated token
4. **Middleware Order**: Always use `authMiddleware` before `requireRole` middleware
5. **Frontend Guards**: Frontend guards are for UX only - backend always validates permissions

## Best Practices

1. **Backend Validation**: Always validate permissions on backend, never trust frontend alone
2. **Principle of Least Privilege**: Grant minimum necessary level
3. **Audit Logging**: Log all user level changes (admin actions)
4. **Consistent Naming**: Use 'user_level' (not 'role', 'level', or 'permission')
5. **Hierarchical Checks**: Higher levels inherit lower level permissions

## Future Enhancements

Potential extensions to the system:

- Permission-based access control (in addition to roles)
- Custom role definitions
- Department/organization-based access
- Temporary elevated privileges
- Role expiration dates
- Multiple roles per user
- Activity audit log for admin actions
