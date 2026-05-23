module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/index.js',
    '!server/config/database.js',
    '!server/config/migrations.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/release/',
    '/frontend/'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // JUnit reporter for Jenkins integration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ]
};
