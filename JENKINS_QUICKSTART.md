# Quick Start for Jenkins Pipeline

## Choose Your Setup

### Option 1: Local Development Setup (Recommended for Testing)
**Use your development folder directly - No Git needed!**

See **[JENKINS_LOCAL_SETUP.md](JENKINS_LOCAL_SETUP.md)** for detailed guide.

**Quick steps:**
1. Create Jenkins Pipeline job
2. Point Pipeline to `Jenkinsfile`
3. Click Build Now!

**The Jenkinsfile already includes:**
```groovy
agent {
    any
    customWorkspace 'D:\\Work\\preerp'
}
```
No UI configuration needed!

**Benefits:**
- ⚡ Super fast - no Git checkout
- 🔄 Reuses your installed dependencies  
- 📦 Works on your current code immediately

---

### Option 2: Git Repository Setup (Production CI/CD)
**Standard setup with Git checkout**

See **[JENKINS_SETUP.md](JENKINS_SETUP.md)** for detailed guide.

## Install Test Reporter Dependencies

```powershell
# Backend - Install jest-junit reporter
npm install

# Frontend - Install karma-junit-reporter
cd frontend
npm install
```

## Run Pipeline Locally (Optional Testing)

Test each stage manually before running in Jenkins:

```powershell
# 1. Install dependencies
npm install
cd frontend
npm install
cd ..

# 2. Run backend tests
npm test -- --ci --coverage

# 3. Run frontend tests
cd frontend
npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
cd ..

# 4. Build frontend
cd frontend
npm run build
cd ..

# 5. Check build output
dir frontend\dist\preerp\browser
```

## Jenkins Setup Checklist

- [ ] Install required Jenkins plugins (Pipeline, NodeJS, HTML Publisher, JUnit)
- [ ] Configure NodeJS tool in Jenkins (name: "NodeJS")
- [ ] Create pipeline job pointing to Jenkinsfile
- [ ] Run first build
- [ ] Download release ZIP from Jenkins artifacts

## Release Package Contents

The pipeline creates a ZIP file containing:
- Backend server code
- Built frontend (production)
- Database scripts and migrations
- Documentation
- DEPLOY.md with deployment instructions

Extract and follow DEPLOY.md to deploy the application.
