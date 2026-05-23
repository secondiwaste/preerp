import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService, AuthResponse, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    user_level: 'user'
  };

  const mockAuthResponse: AuthResponse = {
    success: true,
    message: 'Success',
    data: {
      user: mockUser,
      token: 'test-token-123'
    }
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should load user from localStorage on init', () => {
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      // Create a completely new service instance by creating a new TestBed
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [
          AuthService,
          { provide: Router, useValue: routerSpy }
        ]
      });
      const newService = TestBed.inject(AuthService);
      
      expect(newService.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null if no user in localStorage', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('register', () => {
    it('should register user and store credentials', (done) => {
      service.register('newuser', 'password123').subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('auth_token')).toBe('test-token-123');
        expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
        expect(service.getCurrentUser()).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'newuser', password: 'password123' });
      req.flush(mockAuthResponse);
    });

    it('should not store credentials on failed registration', (done) => {
      const errorResponse: AuthResponse = {
        success: false,
        message: 'Username already exists'
      };

      service.register('existinguser', 'password123').subscribe(response => {
        expect(response).toEqual(errorResponse);
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_user')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/auth/register');
      req.flush(errorResponse);
    });
  });

  describe('login', () => {
    it('should login user and store credentials', (done) => {
      service.login('testuser', 'password123').subscribe(response => {
        expect(response).toEqual(mockAuthResponse);
        expect(localStorage.getItem('auth_token')).toBe('test-token-123');
        expect(localStorage.getItem('auth_user')).toBe(JSON.stringify(mockUser));
        expect(service.getCurrentUser()).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username: 'testuser', password: 'password123' });
      req.flush(mockAuthResponse);
    });

    it('should not store credentials on failed login', (done) => {
      const errorResponse: AuthResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      service.login('wronguser', 'wrongpass').subscribe(response => {
        expect(response).toEqual(errorResponse);
        expect(localStorage.getItem('auth_token')).toBeNull();
        done();
      });

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(errorResponse);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
    });

    it('should call logout endpoint and clear credentials', () => {
      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true });

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
      expect(service.getCurrentUser()).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should clear credentials even if logout endpoint fails', (done) => {
      service.logout();

      const req = httpMock.expectOne('/api/auth/logout');
      req.error(new ProgressEvent('error'));

      // Wait for finalize to complete
      setTimeout(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('auth_user')).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        done();
      }, 10);
    });

    it('should clear credentials if no token exists', () => {
      localStorage.clear();
      service.logout();

      httpMock.expectNone('/api/auth/logout');
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'test-token');
      expect(service.getToken()).toBe('test-token');
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false if no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false if token is invalid', () => {
      localStorage.setItem('auth_token', 'invalid-token');
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true if token is valid and not expired', () => {
      // Create a token that expires in 1 hour
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = btoa(JSON.stringify({ exp: futureExp }));
      const token = `header.${payload}.signature`;
      
      localStorage.setItem('auth_token', token);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if token is expired', () => {
      // Create a token that expired 1 hour ago
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const payload = btoa(JSON.stringify({ exp: pastExp }));
      const token = `header.${payload}.signature`;
      
      localStorage.setItem('auth_token', token);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from subject', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    it('should return null if no user logged in', () => {
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('getUserLevel', () => {
    it('should return user level of logged in user', () => {
      service['currentUserSubject'].next(mockUser);
      expect(service.getUserLevel()).toBe('user');
    });

    it('should return "user" as default level', () => {
      expect(service.getUserLevel()).toBe('user');
    });
  });

  describe('hasRole', () => {
    it('should return true if user has exact required role', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'moderator' });
      expect(service.hasRole('moderator')).toBe(true);
    });

    it('should return true if user has higher role', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'administrator' });
      expect(service.hasRole('moderator')).toBe(true);
      expect(service.hasRole('user')).toBe(true);
    });

    it('should return false if user has lower role', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'user' });
      expect(service.hasRole('moderator')).toBe(false);
      expect(service.hasRole('administrator')).toBe(false);
    });

    it('should default to user level if no user', () => {
      expect(service.hasRole('user')).toBe(true);
      expect(service.hasRole('moderator')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is administrator', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'administrator' });
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false if user is not administrator', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'moderator' });
      expect(service.isAdmin()).toBe(false);
    });
  });

  describe('isModerator', () => {
    it('should return true if user is moderator', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'moderator' });
      expect(service.isModerator()).toBe(true);
    });

    it('should return true if user is administrator', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'administrator' });
      expect(service.isModerator()).toBe(true);
    });

    it('should return false if user is regular user', () => {
      service['currentUserSubject'].next({ ...mockUser, user_level: 'user' });
      expect(service.isModerator()).toBe(false);
    });
  });

  describe('currentUser$ observable', () => {
    it('should emit user changes', (done) => {
      service.currentUser$.subscribe(user => {
        if (user) {
          expect(user).toEqual(mockUser);
          done();
        }
      });

      service['currentUserSubject'].next(mockUser);
    });

    it('should emit null when user logs out', (done) => {
      service['currentUserSubject'].next(mockUser);
      
      service.currentUser$.subscribe(user => {
        if (user === null) {
          done();
        }
      });

      service['currentUserSubject'].next(null);
    });
  });
});
