# Quick Start Guide

## 1. Setup Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE preerp_db;

# Exit MySQL
exit
```

## 2. Configure Environment

```bash
# Copy environment file
copy .env.example .env

# Edit .env and set your MySQL password
```

## 3. Install Dependencies

```bash
npm run install:all
```

## 4. Start Development

**Option A: Development Mode (Hot Reload)**

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
cd frontend
npm start
```

Visit: http://localhost:4200

**Option B: Production Mode**

```bash
npm run build:frontend
npm start
```

Visit: http://localhost:3000

## 5. Test the App

1. Click "Register" and create an account
2. Login with your credentials
3. Access the protected dashboard
4. View all registered users

## Default Credentials

Create your own account - no default credentials exist!

## API Testing with cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"test123\"}"
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"testuser\",\"password\":\"test123\"}"
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/dashboard -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

**Port 3000 in use?**
```env
# Change in .env
PORT=3001
```

**Database connection failed?**
- Check MySQL is running
- Verify credentials in .env
- Ensure preerp_db exists

**Frontend won't start?**
```bash
cd frontend
rmdir /s node_modules
npm install
```
