# Frontend Unit Tests

This directory contains comprehensive unit tests for the Angular 18 frontend application using Jasmine and Karma.

## Test Structure

```
frontend/src/app/
├── services/           # Service tests
│   ├── auth.service.spec.ts
│   ├── toast.service.spec.ts
│   └── translation.service.spec.ts
├── guards/            # Route guard tests
│   ├── auth.guard.spec.ts
│   └── role.guard.spec.ts
├── interceptors/      # HTTP interceptor tests
│   └── auth.interceptor.spec.ts
└── pipes/             # Pipe tests
    └── translate.pipe.spec.ts
```

## Running Tests

### Run all tests
```bash
cd frontend
npm test
```

### Run tests in headless mode (CI)
```bash
ng test --watch=false --browsers=ChromeHeadless
```

### Run tests with code coverage
```bash
ng test --code-coverage
```

### Run specific test file
```bash
ng test --include='**/auth.service.spec.ts'
```

### Run tests matching a pattern
```bash
ng test --grep="should login user"
```

## Test Coverage

The test suite provides comprehensive coverage for:

### Services (3 files)
- **auth.service.spec.ts** - Authentication, JWT token management, user state, role-based access
  - Registration and login flows
  - Token storage and validation
  - User session management
  - Role hierarchy (user, moderator, administrator)
  - Observable user state updates

- **toast.service.spec.ts** - Toast notification system
  - Success, error, info, warning notifications
  - Auto-incrementing toast IDs
  - Configurable duration
  - Observable toast stream

- **translation.service.spec.ts** - Internationalization (i18n)
  - Server-driven locale configuration
  - Translation loading and caching
  - Nested key resolution
  - Fallback to English on errors
  - Multiple language support (en, hu, de)

### Guards (2 files)
- **auth.guard.spec.ts** - Authentication protection
  - Authenticated user access
  - Unauthenticated redirect to login
  - Return URL preservation

- **role.guard.spec.ts** - Role-based access control (RBAC)
  - Role hierarchy enforcement
  - Admin-only routes
  - Moderator-only routes
  - Insufficient privilege handling
  - Factory pattern for custom roles

### Interceptors (1 file)
- **auth.interceptor.spec.ts** - HTTP request/response handling
  - JWT token injection into requests
  - 401 error handling (logout + redirect)
  - Token presence/absence handling
  - Non-401 error pass-through
  - Request header preservation

### Pipes (1 file)
- **translate.pipe.spec.ts** - Translation pipe
  - Key-based translation
  - Nested key support
  - Missing translation handling
  - Pure:false for reactive updates
  - Special character handling

## Test Configuration

Tests are configured via the following files:

- **karma.conf.js** - Test runner configuration
  - Chrome browser
  - Jasmine framework
  - Coverage reporter (HTML + LCOV)
  - Auto-watch for development

- **tsconfig.spec.json** - TypeScript configuration for tests
  - Jasmine type definitions
  - Test file inclusion patterns

- **test.ts** - Test bootstrapper
  - Zone.js setup
  - Angular testing environment initialization

## Testing Patterns

### Services with HttpClient

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [MyService]
  });

  httpMock = TestBed.inject(HttpTestingController);
});

it('should make HTTP request', () => {
  service.getData().subscribe(data => {
    expect(data).toEqual(mockData);
  });

  const req = httpMock.expectOne('/api/data');
  expect(req.request.method).toBe('GET');
  req.flush(mockData);
});
```

### Guards (Functional Guards)

```typescript
it('should allow/deny access', () => {
  const result = TestBed.runInInjectionContext(() => 
    guardFunction(mockRoute, mockState)
  );

  expect(result).toBe(true);
});
```

### Interceptors (Functional Interceptors)

```typescript
it('should modify request', (done) => {
  TestBed.runInInjectionContext(() => {
    const result = interceptorFunction(request, mockNext);

    result.subscribe(() => {
      const interceptedReq = mockNext.calls.mostRecent().args[0];
      expect(interceptedReq.headers.get('Authorization')).toBe('Bearer token');
      done();
    });
  });
});
```

### Observables

```typescript
it('should emit values', (done) => {
  service.observable$.subscribe(value => {
    expect(value).toBe(expectedValue);
    done();
  });

  service.triggerEmission();
});
```

### LocalStorage

```typescript
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

it('should store data', () => {
  service.saveData('key', 'value');
  expect(localStorage.getItem('key')).toBe('value');
});
```

## Best Practices

1. **AAA Pattern**: Arrange-Act-Assert structure for clarity
2. **Isolation**: Each test should be independent (use beforeEach/afterEach)
3. **Descriptive Names**: Use "should..." format
4. **Mock Dependencies**: Spy on external services
5. **Async Handling**: Use `done()` callback or async/await
6. **Coverage Goals**: Aim for >80% code coverage
7. **Fast Tests**: Avoid real HTTP calls, use mocks

## Common Test Scenarios

### Testing Authentication Flow
```typescript
it('should login and store credentials', (done) => {
  service.login('user', 'pass').subscribe(response => {
    expect(localStorage.getItem('auth_token')).toBeTruthy();
    expect(service.getCurrentUser()).toBeTruthy();
    done();
  });

  const req = httpMock.expectOne('/api/auth/login');
  req.flush(mockAuthResponse);
});
```

### Testing Guards
```typescript
it('should redirect unauthenticated users', () => {
  authService.isAuthenticated.and.returnValue(false);

  const result = TestBed.runInInjectionContext(() => 
    authGuard(mockRoute, mockState)
  );

  expect(result).toBe(false);
  expect(router.navigate).toHaveBeenCalledWith(['/login']);
});
```

### Testing Error Handling
```typescript
it('should handle HTTP errors', (done) => {
  service.getData().subscribe({
    error: (error) => {
      expect(error.status).toBe(500);
      done();
    }
  });

  const req = httpMock.expectOne('/api/data');
  req.error(new ProgressEvent('error'), { status: 500 });
});
```

### Testing JWT Token Expiration
```typescript
it('should detect expired token', () => {
  const pastExp = Math.floor(Date.now() / 1000) - 3600;
  const payload = btoa(JSON.stringify({ exp: pastExp }));
  const token = `header.${payload}.signature`;
  
  localStorage.setItem('auth_token', token);
  expect(service.isAuthenticated()).toBe(false);
});
```

## Debugging Tests

### View test output in browser
```bash
ng test
# Navigate to http://localhost:9876/ in Chrome
```

### Enable detailed logging
```typescript
it('should do something', () => {
  console.log('Debug info:', someValue);
  expect(someValue).toBe(expected);
});
```

### Focus on specific test
```typescript
fit('should focus on this test', () => {
  // Only this test runs
});

fdescribe('focus on this suite', () => {
  // Only tests in this suite run
});
```

### Skip tests
```typescript
xit('should skip this test', () => {
  // This test is skipped
});

xdescribe('skip this suite', () => {
  // All tests in this suite are skipped
});
```

## Coverage Reports

After running tests with `--code-coverage`:

- **HTML Report**: `frontend/coverage/index.html`
- **LCOV Report**: `frontend/coverage/lcov.info`
- **Console Summary**: Displayed in terminal

Coverage metrics:
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches tested
- **Functions**: Percentage of functions called
- **Lines**: Percentage of code lines executed

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Run frontend tests
  run: |
    cd frontend
    npm ci
    npm run test -- --watch=false --browsers=ChromeHeadless --code-coverage
```

### Test Thresholds (package.json)
```json
"test": {
  "coverageThreshold": {
    "global": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    }
  }
}
```

## Troubleshooting

### "Cannot find module" errors
- Ensure all imports use correct paths
- Check tsconfig.spec.json includes test files

### "Timeout" errors
- Increase jasmine timeout in karma.conf.js
- Use `done()` callback for async tests
- Check for unresolved observables

### "Expected spy ... to have been called"
- Verify spy is created before test runs
- Check if function is actually invoked
- Ensure async operations complete

### "No provider for ..." errors
- Add service to TestBed providers
- Import required modules in TestBed

## Resources

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [Karma Configuration](https://karma-runner.github.io/latest/config/configuration-file.html)
- [Testing Best Practices](https://testingangular.com/)

## Test Statistics

- **Total Test Suites**: 7
- **Total Tests**: ~100+
- **Test Framework**: Jasmine 5.1
- **Test Runner**: Karma 6.4
- **Browser**: Chrome (headless for CI)
- **Coverage Target**: 80%+

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass: `npm test`
3. Maintain or improve coverage
4. Follow existing patterns
5. Update this README for new test categories
