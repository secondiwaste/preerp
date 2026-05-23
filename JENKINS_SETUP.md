# Jenkins Pipeline Setup Guide

This document describes how to set up and configure the Jenkins pipeline for the PreeRP application.

## Prerequisites

### 1. Jenkins Installation
- Jenkins 2.300+ installed and running
- Required Jenkins plugins:
  - Pipeline plugin
  - NodeJS plugin
  - HTML Publisher plugin
  - JUnit plugin
  - Git plugin

### 2. System Requirements
- Windows Server or Windows 10/11
- Node.js 16+ installed on Jenkins agent
- Chrome/Chromium for headless testing
- Git installed

## Jenkins Configuration

### Step 1: Install Jenkins Plugins

1. Go to **Manage Jenkins** → **Manage Plugins**
2. Install the following plugins:
   - **Pipeline** (for Jenkinsfile support)
   - **NodeJS Plugin** (for Node.js tool management)
   - **HTML Publisher Plugin** (for coverage reports)
   - **JUnit Plugin** (for test result visualization)
   - **Git Plugin** (for source control)

### Step 2: Configure Node.js Tool

1. Go to **Manage Jenkins** → **Global Tool Configuration**
2. Scroll to **NodeJS** section
3. Click **Add NodeJS**
   - Name: `NodeJS` (must match the Jenkinsfile)
   - Version: Select Node.js 16.x or higher
   - Global npm packages to install: (leave empty)
4. Click **Save**

### Step 3: Configure Chrome for Headless Testing

Ensure Chrome or Chromium is installed on the Jenkins agent:

```powershell
# Check if Chrome is installed
Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion | Where-Object {$_.DisplayName -like "*Chrome*"}
```

If not installed, download and install Chrome from https://www.google.com/chrome/

### Step 4: Install Test Reporter Dependencies

Run these commands in the project root and frontend directories:

```powershell
# Backend - Install jest-junit reporter
npm install --save-dev jest-junit

# Frontend - Install karma-junit-reporter
cd frontend
npm install --save-dev karma-junit-reporter
```

### Step 5: Create Jenkins Pipeline Job

1. **Create New Job**
   - Go to Jenkins dashboard
   - Click **New Item**
   - Enter job name: `PreeRP-Build`
   - Select **Pipeline**
   - Click **OK**

2. **Configure Source Code Management**
   - In **Pipeline** section, select **Pipeline script from SCM**
   - SCM: `Git`
   - Repository URL: Enter your Git repository URL
   - Credentials: Add/select Git credentials if needed
   - Branch: `*/main` (or your default branch)
   - Script Path: `Jenkinsfile`

3. **Configure Build Triggers** (optional)
   - Poll SCM: `H/5 * * * *` (check every 5 minutes)
   - Or use GitHub/GitLab webhooks for instant builds

4. **Save** the configuration

## Pipeline Stages

The pipeline consists of the following stages:

### 1. Checkout
- Clones the Git repository

### 2. Install Dependencies
- **Backend Dependencies**: Installs Node.js packages for server
- **Frontend Dependencies**: Installs Node.js packages for Angular app
- Runs in parallel for faster execution

### 3. Run Tests
- **Backend Tests**: Runs Jest unit tests with coverage
  - Generates JUnit XML report: `coverage/junit.xml`
  - Generates HTML coverage report: `coverage/index.html`
  - Tests must pass or build fails
  
- **Frontend Tests**: Runs Karma/Jasmine tests with coverage
  - Uses ChromeHeadless for CI environment
  - Generates JUnit XML report: `frontend/coverage/junit.xml`
  - Generates HTML coverage report: `frontend/coverage/index.html`
  - Tests must pass or build fails
  
- Runs in parallel for faster execution

### 4. Build Frontend
- Builds Angular application for production
- Output: `frontend/dist/preerp/browser/`
- Optimized and minified assets

### 5. Prepare Release Package
- Creates directory structure
- Copies backend files (excludes node_modules, tests)
- Copies built frontend to `/public`
- Copies database scripts and migrations
- Copies documentation
- Generates `DEPLOY.md` with deployment instructions
- Creates ZIP archive

### 6. Archive Artifacts
- Stores release ZIP file
- Stores test coverage reports
- Artifacts available for download from Jenkins UI

## Build Outputs

### Test Reports
- **Backend Coverage**: Available in Jenkins as "Backend Coverage Report"
- **Frontend Coverage**: Available in Jenkins as "Frontend Coverage Report"
- **Test Results**: JUnit format, displayed in Jenkins test results

### Release Package
- **Filename**: `preerp-{BUILD_NUMBER}-{TIMESTAMP}.zip`
- **Location**: Jenkins artifacts (accessible from build page)
- **Contents**:
  - `/server` - Backend application
  - `/public` - Built frontend
  - `/database` - Database scripts
  - `/migrations` - Migration files
  - `package.json` - Dependencies
  - Documentation files
  - `DEPLOY.md` - Deployment instructions

## Troubleshooting

### Chrome Not Found
If tests fail with "ChromeHeadless not found":
```powershell
# Set Chrome path in environment
setx CHROME_BIN "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

### Permission Issues
If Jenkins cannot access files:
1. Check Jenkins service user permissions
2. Ensure Jenkins user has write access to workspace
3. Consider running Jenkins as a different user

### Tests Failing in CI but Passing Locally
1. Check Node.js version matches
2. Verify all dependencies are installed
3. Check for timezone/locale issues
4. Review Jenkins console output for specific errors

### Memory Issues
If builds fail with out-of-memory errors:
1. Increase Jenkins JVM heap size
2. Add `--max-old-space-size=4096` to Node.js options
3. Reduce parallel test workers: `--maxWorkers=2`

## Environment Variables

The following environment variables are used:

- `BUILD_NUMBER`: Jenkins build number (automatic)
- `BUILD_TIMESTAMP`: Build date/time in format YYYYMMDD-HHMMSS
- `RELEASE_NAME`: Combined build identifier
- `GIT_COMMIT`: Git commit hash (automatic)
- `GIT_BRANCH`: Git branch name (automatic)

## Customization

### Modify Test Configuration

**Backend tests** (jest.config.js):
```javascript
reporters: [
  'default',
  ['jest-junit', {
    outputDirectory: 'coverage',
    outputName: 'junit.xml'
  }]
]
```

**Frontend tests** (karma.conf.js):
```javascript
junitReporter: {
  outputDir: './coverage',
  outputFile: 'junit.xml',
  suite: 'frontend'
}
```

### Add Additional Stages

You can extend the Jenkinsfile with additional stages:

```groovy
stage('Security Scan') {
    steps {
        bat 'npm audit --production'
    }
}

stage('Linting') {
    steps {
        bat 'npm run lint'
    }
}

stage('Deploy to Staging') {
    when {
        branch 'develop'
    }
    steps {
        // Add deployment commands
    }
}
```

## Best Practices

1. **Version Control**: Keep Jenkinsfile in Git repository
2. **Parallel Execution**: Use parallel stages for faster builds
3. **Test Reports**: Always publish test results and coverage
4. **Artifacts**: Archive important build outputs
5. **Notifications**: Add email/Slack notifications for build status
6. **Security**: Use Jenkins credentials for sensitive data
7. **Clean Workspace**: Clean workspace between builds if needed

## Maintenance

### Update Dependencies
Regularly update test reporters:
```powershell
npm update jest-junit
cd frontend
npm update karma-junit-reporter
```

### Monitor Build Times
- Track build duration trends in Jenkins
- Optimize slow stages
- Consider caching node_modules

### Review Test Coverage
- Set minimum coverage thresholds
- Fail builds if coverage drops below threshold
- Monitor coverage trends over time

## Support

For issues or questions:
1. Check Jenkins console output
2. Review test reports in Jenkins UI
3. Verify local build works: Run pipeline stages manually
4. Check Jenkins logs: `{JENKINS_HOME}/jobs/{JOB_NAME}/builds/{BUILD_NUMBER}/log`
