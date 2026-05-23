# Jenkins Local Setup Guide

This guide shows how to configure Jenkins to run builds directly from your development folder without Git checkout.

## Why Local Setup?

- **Lightweight**: No Git operations, works with your current files
- **Fast**: Skip checkout stage, reuse installed dependencies
- **Convenient**: Test pipeline changes immediately
- **Development**: Perfect for local CI/CD testing

## Prerequisites

✅ Jenkins installed and running on your computer  
✅ NodeJS plugin installed in Jenkins  
✅ Node.js configured in Jenkins (name: "NodeJS")  
✅ Chrome/Chromium installed for tests  

## Step-by-Step Configuration

### 1. Create Jenkins Pipeline Job

1. Open Jenkins: `http://localhost:8080`
2. Click **New Item**
3. Enter name: `PreeRP-Local-Build`
4. Select **Pipeline**
5. Click **OK**

### 2. Configure Pipeline

In the job configuration page, scroll to **Pipeline** section:

- **Definition**: `Pipeline script from SCM`
- **SCM**: `None` (or any, it will be ignored due to skipDefaultCheckout)
- **Script Path**: `Jenkinsfile`

**Alternative - Pipeline Script**:
- **Definition**: `Pipeline script`
- Copy the entire contents of your `Jenkinsfile` into the script box

### 3. Save Configuration

Click **Save** at the bottom

**That's it!** The Jenkinsfile already includes the custom workspace configuration (`D:\Work\preerp`), so you don't need to configure it in the Jenkins UI.

Add build parameters for more control:

1. Check **✓ This project is parameterized**
2. Add **Boolean Parameter**:
   - Name: `FORCE_INSTALL`
   - Default: `false`
   - Description: `Force reinstall dependencies even if they exist`

### 5. Save Configuration

Click **Save** at the bottom

## Running Builds

### Manual Build

1. Go to job page: `PreeRP-Local-Build`
2. Click **Build Now** (or **Build with Parameters** if you added parameters)
3. Watch console output
4. Download release package from **Build Artifacts**

### Automatic Builds (Optional)

Add build triggers in job configuration:

**Build Periodically** (every hour):
```
H * * * *
```

**Poll Filesystem** - Use a plugin like **Filesystem Trigger** to watch for changes

## How It Works

### Traditional Jenkins (Git)
```
Jenkins Workspace (copy) ← Git checkout ← Your Repository
                ↓
           Run builds
```

### Local Jenkins Setup
```
Your Development Folder (D:\Work\preerp)
                ↓
    Jenkins uses it directly as workspace
                ↓
           Run builds
```

## Important Notes

### ⚠️ Working on Live Files

- Jenkins runs tests and builds **on your actual development files**
- Make sure you've committed or backed up important changes before running
- Release packages are created in `release/` folder in your project

### 💡 Lightweight Features

**Smart Dependency Installation**:
- Only installs `node_modules` if missing
- Skips if already installed (saves time!)
- Force reinstall with `FORCE_INSTALL=true` parameter

**No Checkout Delay**:
- Skips Git operations entirely
- Build starts immediately on your current code

**Shared node_modules**:
- Uses your development dependencies
- No duplicate installs

### 🔧 Development Workflow

1. **Make code changes** in your IDE
2. **Run Jenkins build** - tests your changes
3. **View results** - tests, coverage, artifacts
4. **Get release package** - ready-to-deploy ZIP

## Pipeline Stages

### 1. Verify Source
- Confirms Jenkins is using your local directory
- Shows workspace path

### 2. Install Dependencies (Smart)
- Checks if `node_modules` exists
- Skips installation if already present
- Installs only if missing or forced

### 3. Run Tests
- Backend: Jest with coverage
- Frontend: Karma/Jasmine with coverage
- **Fails build if any test fails**

### 4. Build Frontend
- Production Angular build
- Minified and optimized

### 5. Prepare Release Package
- Creates complete deployment package
- Includes all necessary files
- Generates deployment instructions

### 6. Archive Artifacts
- Stores release ZIP
- Publishes test coverage reports

## Troubleshooting

### "Workspace is in use"

If Jenkins complains about workspace:
- Stop any running builds
- Delete workspace: Job → Workspace → Wipe Out Workspace
- Run build again

### "Permission denied"

Jenkins service needs permission to read your folder:
1. Right-click `D:\Work\preerp` → Properties → Security
2. Add Jenkins user (usually `NT AUTHORITY\SYSTEM` or your user)
3. Grant **Read & Execute** permissions

### "node_modules not found"

If dependencies are skipped but shouldn't be:
- Run build with `FORCE_INSTALL=true` parameter
- Or delete `node_modules` and run again

### Tests fail but pass locally

Check:
- Node version matches (run `node --version` in both places)
- Environment variables (`.env` file exists)
- Port 3000 not in use (Jenkins might conflict with running dev server)

## Best Practices

### ✅ Do:
- Keep development server stopped during builds
- Commit changes before running builds
- Review test reports in Jenkins UI
- Use build parameters for flexibility

### ❌ Don't:
- Run builds while actively editing files
- Delete files during build execution
- Modify `.env` during build (use copies for Jenkins)

## Comparing: Local vs Git Setup

| Feature | Local Setup | Git Setup |
|---------|-------------|-----------|
| **Speed** | ⚡ Very fast | Slower (checkout time) |
| **Setup** | Custom workspace | Standard |
| **Source** | Your dev folder | Git repository |
| **Dependencies** | Shared/smart | Always fresh |
| **Use Case** | Development/testing | Production CI/CD |
| **Isolation** | Low (uses your files) | High (separate copy) |

## Switching to Git Later

When ready for production CI/CD:

1. Create new Jenkins job: `PreeRP-Production`
2. Use **Git** SCM configuration
3. Point to your Git repository
4. Keep this local job for development testing

## Clean Up Release Packages

Release ZIPs accumulate over time:

```powershell
# In your project folder
Remove-Item release\*.zip -Force

# Or in Jenkins: Job → Configure → Discard old builds
# Keep: Last 10 builds, 7 days
```

## Advanced: Multiple Environments

Create multiple Jenkins jobs:

- `PreeRP-Local-Dev` - Your local files (this setup)
- `PreeRP-Local-Test` - Custom workspace to `D:\Work\preerp-test`
- `PreeRP-Git-Staging` - Git branch `develop`
- `PreeRP-Git-Production` - Git branch `main`

## Command Reference

### Force Dependency Reinstall
```powershell
# From Jenkins build parameter: FORCE_INSTALL=true
# Or manually:
Remove-Item node_modules -Recurse -Force
Remove-Item frontend\node_modules -Recurse -Force
```

### Test Pipeline Locally
```powershell
# Run each stage manually before Jenkins
cd D:\Work\preerp

# Install
npm install
cd frontend; npm install; cd ..

# Test
npm test -- --ci --coverage
cd frontend; npm test -- --watch=false --browsers=ChromeHeadless --code-coverage; cd ..

# Build
cd frontend; npm run build; cd ..
```

### Check Jenkins Workspace
```powershell
# Default Jenkins workspace location:
# C:\Program Files\Jenkins\workspace\PreeRP-Local-Build

# With custom workspace:
# D:\Work\preerp (your actual dev folder!)
```

## Support

If you encounter issues:

1. Check **Console Output** in Jenkins build
2. Verify custom workspace path is correct
3. Ensure all dependencies installed locally
4. Check file permissions
5. Review `JENKINS_SETUP.md` for general Jenkins configuration

---

**Ready to build?** Go to Jenkins and click **Build Now**! 🚀
