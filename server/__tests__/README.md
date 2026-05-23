# Backend Unit Tests

This directory contains comprehensive unit tests for the backend JavaScript files using Jest as the testing framework.

## Test Structure

```
server/__tests__/
├── models/              # Model layer tests
│   ├── User.test.js
│   ├── Session.test.js
│   └── Log.test.js
├── controllers/         # Controller layer tests
│   ├── authController.test.js
│   ├── configController.test.js
│   └── logsController.test.js
├── middleware/          # Middleware tests
│   ├── auth.test.js
│   └── requireRole.test.js
└── utils/              # Utility function tests
    └── logger.test.js
```

## Running Tests

### Run all tests with coverage
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run specific test file
```bash
npx jest server/__tests__/models/User.test.js
```

### Run tests matching a pattern
```bash
npx jest --testNamePattern="should login user"
```

## Test Coverage

The test suite covers:

### Models (server/models/)
- **User.js**: User creation, authentication, password management, user queries
- **Session.js**: Session creation, token management, session cleanup
- **Log.js**: Log creation, filtering, pagination, category management

### Controllers (server/controllers/)
- **authController.js**: Registration, login, logout, profile, password changes
- **configController.js**: Application configuration retrieval
- **logsController.js**: Admin log viewing, filtering, categories

### Middleware (server/middleware/)
- **auth.js**: JWT token verification, session validation
- **requireRole.js**: Role-based access control (RBAC) with hierarchical permissions

### Utils (server/utils/)
- **logger.js**: Multi-level logging, console/database output, log filtering

## Test Configuration

Tests are configured via `jest.config.js` in the project root:

- **Test Environment**: Node.js
- **Coverage Directory**: `coverage/`
- **Test Pattern**: `**/__tests__/**/*.test.js`
- **Coverage Exclusions**: `server/index.js`, `server/config/database.js`, `server/config/migrations.js`

## Mocking Strategy

Tests use Jest's mocking capabilities to isolate units under test:

1. **Database Mocking**: All database queries are mocked using `jest.mock('../../config/database')`
2. **External Dependencies**: Third-party modules like `bcryptjs`, `jsonwebtoken` are mocked
3. **Internal Dependencies**: Logger and i18n are mocked to avoid side effects
4. **Consistent Mocks**: `clearMocks: true` ensures clean state between tests

## Writing New Tests

### Test File Template

```javascript
const ModuleUnderTest = require('../../path/to/module');

// Mock dependencies
jest.mock('../../config/database', () => ({
  query: jest.fn()
}));

const pool = require('../../config/database');

describe('Module Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should perform expected behavior', async () => {
      // Arrange
      const mockData = { /* ... */ };
      pool.query.mockResolvedValue([[mockData]]);

      // Act
      const result = await ModuleUnderTest.methodName(params);

      // Assert
      expect(result).toEqual(expected);
      expect(pool.query).toHaveBeenCalledWith(expectedQuery, expectedParams);
    });

    it('should handle error cases', async () => {
      // Arrange
      pool.query.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(ModuleUnderTest.methodName(params)).rejects.toThrow('Database error');
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert**: Structure tests clearly with setup, execution, and verification
2. **One Assertion Per Test**: Focus each test on a single behavior
3. **Descriptive Names**: Use "should..." format for test descriptions
4. **Mock Isolation**: Each test should have independent mocks
5. **Error Testing**: Always test both success and error paths
6. **Async Handling**: Use `async/await` for asynchronous operations
7. **Coverage Goals**: Aim for >80% coverage on critical paths

## Common Test Patterns

### Testing Async Functions
```javascript
it('should handle async operations', async () => {
  mockFunction.mockResolvedValue(expectedValue);
  const result = await asyncFunction();
  expect(result).toBe(expectedValue);
});
```

### Testing Error Handling
```javascript
it('should handle errors gracefully', async () => {
  mockFunction.mockRejectedValue(new Error('Expected error'));
  await expect(functionUnderTest()).rejects.toThrow('Expected error');
});
```

### Testing HTTP Responses
```javascript
it('should return 404 when resource not found', async () => {
  await controller(req, res);
  expect(res.status).toHaveBeenCalledWith(404);
  expect(res.json).toHaveBeenCalledWith({
    success: false,
    message: 'Resource not found'
  });
});
```

## Continuous Integration

Tests should be run:
- Before committing code
- In CI/CD pipelines
- Before deploying to production

## Known Limitations

Some tests may require updates to match implementation details:

1. **i18n Mocking**: Translation function mocks return keys; real implementation returns localized strings
2. **Database Connections**: Tests use mocked database; integration tests needed for real DB interactions
3. **Environment Variables**: Some tests depend on `.env` configuration
4. **Session Management**: Full session lifecycle testing requires integration tests

## Troubleshooting

### Tests failing with "Cannot read properties of undefined"
- Check that all dependencies are properly mocked
- Verify mock return values match expected structure

### "Module not found" errors
- Ensure relative paths in `require()` statements are correct
- Check that mocked modules exist

### Coverage not updating
- Delete `coverage/` directory and re-run tests
- Check `collectCoverageFrom` patterns in `jest.config.js`

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `npm test`
3. Maintain or improve coverage percentage
4. Update this README if adding new test categories

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Node.js Testing Guide](https://nodejs.org/en/docs/guides/testing/)
