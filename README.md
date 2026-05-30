# PreERP - Full Stack Node.js Authentication Application

A full-stack application with Angular frontend and Node.js/Express backend, featuring MySQL database integration and JWT-based authentication.

## 🚀 Features

- **Angular 18** frontend with standalone components
- **Node.js/Express** backend server
- **MySQL** database with connection pooling
- **Flyway-style database migrations** with version control
- **JWT (JSON Web Token)** authentication with session tracking
- **Bcrypt** password encryption
- **Hierarchical user level system** (user, moderator, administrator)
- **Role-based access control** for frontend routes and backend endpoints
- **Auth Guard** for protecting routes
- **Role Guards** for level-based route protection
- **HTTP Interceptor** for automatic token injection
- **Secure token storage** with database-backed sessions
- **Internationalization (i18n)** support (English, Hungarian, German)
- Server serves frontend static files in production

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MySQL** (v8 or higher)
- **Angular CLI** (optional, but recommended)

## 🛠️ Installation

### 1. Clone or navigate to the project directory

```bash
cd d:\Work\preerp
```

### 2. Set up MySQL Database

Create a new MySQL database:

```sql
CREATE DATABASE preerp_db;
```

**Note:** Database tables are created automatically via migrations when you start the server. No manual table creation needed!

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and update the database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=preerp_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 4. Install Dependencies

Install root and frontend dependencies:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd frontend
npm install
cd ..
```

## 🏃 Running the Application

### Development Mode

#### Option 1: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The frontend will be available at `http://localhost:4200` with hot-reload.
The backend API will be available at `http://localhost:3000`.

#### Option 2: Run Production Build

First, build the Angular frontend:

```bash
npm run build:frontend
```

Then start the server (serves both API and frontend):

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## 🔐 API Endpoints

### Public Endpoints

- **POST** `/api/auth/register` - Register a new user
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/login` - Login with credentials
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

### Protected Endpoints (Requires JWT Token)

- **POST** `/api/auth/logout` - Logout and remove session from database
- **GET** `/api/auth/profile` - Get current user profile
- **GET** `/api/config` - Get server configuration (default locale, etc.)
- **GET** `/api/dashboard` - Get dashboard data
- **GET** `/api/users` - Get all users

### Using Protected Endpoints

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎨 Frontend Routes

- `/login` - Login and registration page
- `/dashboard` - Protected dashboard (requires authentication)

## 🔒 Security Features

1. **Password Encryption**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Database-Backed Sessions**: Tokens stored in database for immediate revocation
4. **Auth Guard**: Protects routes from unauthorized access
5. **HTTP Interceptor**: Automatically adds JWT token to requests
6. **Token Expiration**: Tokens expire after 24 hours (configurable)
7. **Automatic Logout**: Users are logged out on token expiration
8. **Session Cleanup**: Expired sessions automatically removed from database

## � User Levels & Access Control

The application implements a hierarchical user level system for granular access control.

### User Levels

1. **user** (default) - Basic authenticated access
2. **moderator** - Elevated privileges for content moderation
3. **administrator** - Full system access and user management

### Backend Protection

```javascript
// Require administrator level
router.get('/admin/users', authMiddleware, requireAdmin, handler);

// Require at least moderator level
router.get('/moderator/dashboard', authMiddleware, requireModerator, handler);

// Custom role check
router.get('/custom', authMiddleware, requireRole('moderator'), handler);
```

### Frontend Protection

```typescript
// Route guard for admin-only pages
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}

// Check user level in component
isAdmin(): boolean {
  return this.authService.isAdmin();
}
```

### Admin Endpoints

- `GET /api/admin/users` - List all users with levels
- `PUT /api/admin/users/:userId/level` - Update user level

### Creating Admin User

```sql
-- Update existing user to administrator
UPDATE users SET user_level = 'administrator' WHERE username = 'yourusername';
```

**📚 Full Documentation**: See [USER_LEVELS.md](USER_LEVELS.md) for detailed guide.

## �📁 Project Structure

```
preerp/
├── server/
│   ├── config/
│   │   ├── database.js          # Database connection
│   │   ├── migrations.js        # Migration runner
│   │   └── i18n.js              # Internationalization
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT verification middleware
│   │   └── requireRole.js       # Role-based access control
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Session.js           # Session/token model
│   ├── routes/
│   │   ├── authRoutes.js        # Auth routes
│   │   └── protectedRoutes.js   # Protected routes
│   ├── locales/                 # Translation files
│   │   ├── en.json
│   │   └── hu.json
│   └── index.js                 # Main server file
├── migrations/                   # Database migrations
│   ├── V1__create_users_table.sql
│   ├── V2__create_sessions_table.sql
│   └── V3__add_user_level.sql
├── scripts/
│   └── migration-status.js      # Migration status tool
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/       # Login component
│   │   │   │   └── dashboard/   # Dashboard component
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── translation.service.ts
│   │   │   ├── pipes/
│   │   │   │   └── translate.pipe.ts
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── assets/
│   │   │   └── i18n/            # Frontend translations
│   │   │       ├── en.json
│   │   │       └── hu.json
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── angular.json
│   ├── tsconfig.json
│   └── package.json
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing the Application

1. Start the application
2. Navigate to `http://localhost:3000` (or `http://localhost:4200` in dev mode)
3. Click "Register" and create a new account
4. Login with your credentials
5. You'll be redirected to the dashboard (protected route)
6. Try accessing `/dashboard` without logging in - you'll be redirected to login

## �️ Database Migrations

This project uses **Flyway-style database migrations** for schema version control.

### How It Works

- **Automatic Execution**: Migrations run automatically when server starts
- **Version Tracking**: Applied migrations tracked in `schema_migrations` table
- **Checksum Validation**: Prevents accidental modification of applied migrations
- **Transaction Safety**: Each migration runs in a transaction with rollback on failure

### Commands

```bash
# Check migration status
npm run migration:status

# Migrations run automatically on server start
npm start
```

### Creating New Migrations

1. Create file in `migrations/` directory: `V{number}__{description}.sql`
   ```bash
   # Example
   migrations/V3__add_email_to_users.sql
   ```

2. Write your SQL:
   ```sql
   -- Add email column to users
   ALTER TABLE users ADD COLUMN email VARCHAR(255) UNIQUE;
   ```

3. Restart server - migration runs automatically

### Important Rules

- ✅ Use sequential version numbers (V1, V2, V3...)
- ✅ Never modify applied migrations (create new one instead)
- ✅ Test on development database first
- ❌ Don't delete migration files
- ❌ Don't skip version numbers

### Example Migrations

```sql
-- V3__add_user_role.sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' NOT NULL;

-- V4__create_products_table.sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
```

**📚 Full Documentation**: See [MIGRATIONS.md](MIGRATIONS.md) for detailed guide.

## �🐛 Troubleshooting

### Database Connection Error

- Ensure MySQL is running
- Verify database credentials in `.env`
- Check if the database exists: `SHOW DATABASES;`
### Migration Failed

1. Check server logs for specific error
2. View failed migrations: `SELECT * FROM schema_migrations WHERE success = FALSE;`
3. Fix the SQL in the migration file
4. Delete failed entry: `DELETE FROM schema_migrations WHERE version = 'X' AND success = FALSE;`
5. Restart server to retry

### Checksum Mismatch Error

- **Error**: "Migration checksum mismatch"
- **Cause**: An applied migration file was modified
- **Solution**: Never modify applied migrations. Create a new migration instead
### Port Already in Use

Change the port in `.env`:
```env
PORT=3001
```

### Frontend Build Errors

Clear node_modules and reinstall:
```bash
cd frontend
rmdir /s node_modules
npm install
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `DB_HOST` | MySQL host | localhost |
| `DB_USER` | MySQL username | root |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | preerp_db |
| `DB_PORT` | MySQL port | 3306 |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 24h |
| `DEFAULT_LOCALE` | Default language (en/hu/de) | en |

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server (runs migrations automatically) |
| `npm run dev` | Start development server with auto-reload |
| `npm run build:frontend` | Build Angular frontend for production |
| `npm run build:docs` | Convert markdown documentation to HTML |
| `npm run watch:frontend` | Watch frontend files and rebuild automatically on change |
| `npm run install:all` | Install all dependencies (root + frontend) |
| `npm run migration:status` | Check database migration status |

## 📚 Documentation Build System

The application includes an automated documentation build system that converts markdown documentation to HTML.

### User Manual

- **Source**: `FELHASZNALOI_KEZIKONYV.md` (markdown format)
- **Build Command**: `npm run build:docs`
- **Output**: `frontend/dist/preerp/browser/docs/index.html`
- **Access**: Available at `http://localhost:3000/docs/` or via navbar menu

### How It Works

1. The `scripts/build-docs.js` script reads the markdown documentation
2. Converts it to HTML using the `marked` library
3. Applies CSS styling for professional appearance
4. Outputs to the frontend dist directory
5. Served as static content by the Express server

### Jenkins Integration

The documentation is automatically built during the Jenkins pipeline:
- **Stage**: "Build Documentation" (after frontend build)
- **Trigger**: Runs on every build
- **Release**: Included in the release package

### Adding to Navbar

The documentation link is available in the navbar menu:
- **Menu Item**: "Felhasználói kézikönyv" 📖
- **Target**: Opens in new browser tab
- **Access**: Available to all authenticated users

### Editing Documentation

1. Edit `FELHASZNALOI_KEZIKONYV.md` in markdown format
2. Run `npm run build:docs` to generate HTML
3. View at `http://localhost:3000/docs/`
4. Commit both markdown and updated builds

**📚 Full Documentation Build Guide**: See [DOCUMENTATION_BUILD.md](DOCUMENTATION_BUILD.md) for detailed information.

## 🔄 Development Workflow

1. Make changes to backend code in `server/`
2. Make changes to frontend code in `frontend/src/`
3. Backend auto-reloads with nodemon (in dev mode): `npm run dev`
4. Frontend auto-rebuilds with watch mode: `npm run watch:frontend`
   - Alternative: Use `ng serve` for dev server with hot reload
5. Test changes in browser
6. Build for production: `npm run build:frontend`

## 📦 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build the frontend: `npm run build:frontend`
3. Start the server: `npm start`
4. The server will serve both API and frontend from port 3000

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC

## 👨‍💻 Author

Your Name

---

**Note**: Remember to change the `JWT_SECRET` in production to a strong, random string!
