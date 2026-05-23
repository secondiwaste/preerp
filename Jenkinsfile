pipeline {
    agent {
        node {
            label ''
            // Custom workspace pointing to your development folder
            // This makes Jenkins use your local files directly instead of copying them
            customWorkspace 'D:\\Work\\preerp'
        }
    }
    
    options {
        // Skip default SCM checkout since we're using local development folder
        skipDefaultCheckout(true)
    }
    
    tools {
        nodejs 'NodeJS' // Configure this in Jenkins Global Tool Configuration
    }
    
    environment {
        // Set build timestamp for release package
        BUILD_TIMESTAMP = bat(script: "@echo %date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%", returnStdout: true).trim().replaceAll(" ", "0")
        RELEASE_NAME = "preerp-${env.BUILD_NUMBER}-${BUILD_TIMESTAMP}"
    }
    
    stages {
        stage('Verify Source') {
            steps {
                echo '📂 Using local development directory as source'
                echo "Workspace: ${env.WORKSPACE}"
                bat 'dir'
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo 'Installing backend dependencies (if needed)...'
                        script {
                            // Only install if node_modules doesn't exist or package.json changed
                            def needsInstall = !fileExists('node_modules') || 
                                              currentBuild.changeSets.any { it.affectedPaths.contains('package.json') }
                            if (needsInstall || env.FORCE_INSTALL == 'true') {
                                bat 'npm install'
                            } else {
                                echo 'Skipping - dependencies already installed'
                            }
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo 'Installing frontend dependencies (if needed)...'
                        dir('frontend') {
                            script {
                                def needsInstall = !fileExists('node_modules') || 
                                                  currentBuild.changeSets.any { it.affectedPaths.contains('frontend/package.json') }
                                if (needsInstall || env.FORCE_INSTALL == 'true') {
                                    bat 'npm install'
                                } else {
                                    echo 'Skipping - dependencies already installed'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        echo 'Running backend unit tests with Jest...'
                        bat 'npm test -- --ci --coverage --maxWorkers=2'
                    }
                    post {
                        always {
                            // Publish backend test results and coverage
                            junit testResults: 'coverage/junit.xml', allowEmptyResults: true
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'coverage',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        echo 'Running frontend unit tests with Karma/Jasmine...'
                        dir('frontend') {
                            bat 'npm test -- --watch=false --browsers=ChromeHeadless --code-coverage'
                        }
                    }
                    post {
                        always {
                            // Publish frontend test results and coverage
                            junit testResults: 'frontend/coverage/junit.xml', allowEmptyResults: true
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                echo 'Building Angular frontend for production...'
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }
        
        stage('Prepare Release Package') {
            steps {
                echo 'Creating release package...'
                script {
                    // Create release directory structure
                    bat """
                        if exist release rmdir /s /q release
                        mkdir release\\${RELEASE_NAME}
                        mkdir release\\${RELEASE_NAME}\\server
                        mkdir release\\${RELEASE_NAME}\\public
                        mkdir release\\${RELEASE_NAME}\\database
                        mkdir release\\${RELEASE_NAME}\\migrations
                    """
                    
                    // Copy backend files (excluding node_modules and tests)
                    bat """
                        xcopy /E /I /Y server release\\${RELEASE_NAME}\\server
                        rmdir /s /q release\\${RELEASE_NAME}\\server\\__tests__
                        copy package.json release\\${RELEASE_NAME}\\
                        copy package-lock.json release\\${RELEASE_NAME}\\
                        copy .env.example release\\${RELEASE_NAME}\\.env.example
                    """
                    
                    // Copy database and migration files
                    bat """
                        xcopy /E /I /Y database release\\${RELEASE_NAME}\\database
                        xcopy /E /I /Y migrations release\\${RELEASE_NAME}\\migrations
                    """
                    
                    // Copy built frontend
                    bat """
                        xcopy /E /I /Y frontend\\dist\\preerp\\browser release\\${RELEASE_NAME}\\public
                    """
                    
                    // Copy documentation
                    bat """
                        copy README.md release\\${RELEASE_NAME}\\
                        copy QUICKSTART.md release\\${RELEASE_NAME}\\
                        copy MIGRATIONS.md release\\${RELEASE_NAME}\\
                        copy I18N.md release\\${RELEASE_NAME}\\
                        copy USER_LEVELS.md release\\${RELEASE_NAME}\\
                    """
                    
                    // Create deployment instructions
                    writeFile file: "release/${RELEASE_NAME}/DEPLOY.md", text: """# Deployment Instructions

## Prerequisites
- Node.js v16+ installed
- MySQL 8+ database server
- Port 3000 available (or configure in .env)

## Installation Steps

1. **Extract Package**
   ```
   unzip ${RELEASE_NAME}.zip
   cd ${RELEASE_NAME}
   ```

2. **Install Dependencies**
   ```
   npm install --production
   ```

3. **Configure Environment**
   ```
   copy .env.example .env
   ```
   Edit `.env` and set:
   - Database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
   - JWT_SECRET (use a strong random string)
   - PORT (default: 3000)
   - LOG_LEVEL (0=DEBUG, 1=INFO, 2=SUCCESS, 3=WARN, 4=ERROR)

4. **Setup Database**
   - Create MySQL database
   - Run migrations automatically on first start, or manually:
     ```
     npm run migration:status
     ```

5. **Start Application**
   ```
   npm start
   ```
   Or use a process manager like PM2:
   ```
   pm2 start server/index.js --name preerp
   ```

6. **Access Application**
   - Open browser: http://localhost:3000
   - Default admin credentials will be created on first run
   - Check server logs for initial setup information

## Build Information
- Build Number: ${env.BUILD_NUMBER}
- Build Date: ${BUILD_TIMESTAMP}
- Git Commit: ${env.GIT_COMMIT ?: 'N/A'}
- Git Branch: ${env.GIT_BRANCH ?: 'N/A'}

## Directory Structure
- `/server` - Backend Node.js/Express application
- `/public` - Frontend Angular application (built)
- `/database` - Database initialization scripts
- `/migrations` - Database migration files
- `/package.json` - Dependencies configuration

## Support
See README.md for detailed documentation.
"""
                    
                    // Create zip package using Node.js archiver
                    bat "npm run create-archive release\\${RELEASE_NAME} release\\${RELEASE_NAME}.zip"
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                echo 'Archiving release package...'
                archiveArtifacts artifacts: "release/${RELEASE_NAME}.zip", fingerprint: true
                
                // Also archive test reports
                archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'frontend/coverage/**/*', allowEmptyArchive: true
            }
        }
    }
    
    post {
        success {
            echo '✅ Build successful! Release package created.'
            echo "Release: ${RELEASE_NAME}.zip"
        }
        failure {
            echo '❌ Build failed! Check test results and logs.'
        }
        always {
            // Clean up workspace if needed
            echo 'Cleaning up...'
            bat 'if exist node_modules\\* echo node_modules present'
        }
    }
}
