import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { roleGuard, adminGuard, moderatorGuard } from './role.guard';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasRole']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });

    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/admin-page' } as RouterStateSnapshot;
  });

  describe('roleGuard factory', () => {
    it('should allow access when user is authenticated and has required role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const guard = roleGuard('moderator');
      const result = TestBed.runInInjectionContext(() => 
        guard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith('moderator');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const guard = roleGuard('administrator');
      const result = TestBed.runInInjectionContext(() => 
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin-page' } }
      );
      expect(authService.hasRole).not.toHaveBeenCalled();
    });

    it('should redirect to dashboard when user lacks required role', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(false);

      const guard = roleGuard('administrator');
      const result = TestBed.runInInjectionContext(() => 
        guard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/dashboard'],
        { queryParams: { error: 'insufficient_privileges' } }
      );
    });

    it('should check correct role level', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const guard = roleGuard('moderator');
      TestBed.runInInjectionContext(() => 
        guard(mockRoute, mockState)
      );

      expect(authService.hasRole).toHaveBeenCalledWith('moderator');
    });
  });

  describe('adminGuard', () => {
    it('should allow access when user is administrator', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        adminGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith('administrator');
    });

    it('should deny access when user is not administrator', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        adminGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/dashboard'],
        { queryParams: { error: 'insufficient_privileges' } }
      );
    });

    it('should redirect to login when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        adminGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin-page' } }
      );
    });
  });

  describe('moderatorGuard', () => {
    it('should allow access when user is moderator', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        moderatorGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
      expect(authService.hasRole).toHaveBeenCalledWith('moderator');
    });

    it('should allow access when user is administrator', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => 
        moderatorGuard(mockRoute, mockState)
      );

      expect(result).toBe(true);
    });

    it('should deny access when user is regular user', () => {
      authService.isAuthenticated.and.returnValue(true);
      authService.hasRole.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        moderatorGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/dashboard'],
        { queryParams: { error: 'insufficient_privileges' } }
      );
    });

    it('should redirect to login when not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => 
        moderatorGuard(mockRoute, mockState)
      );

      expect(result).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin-page' } }
      );
    });
  });

  describe('role hierarchy', () => {
    it('should preserve return URL for all guard types', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState.url = '/admin/users';

      const guard = roleGuard('administrator');
      TestBed.runInInjectionContext(() => 
        guard(mockRoute, mockState)
      );

      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        { queryParams: { returnUrl: '/admin/users' } }
      );
    });

    it('should handle different role levels correctly', () => {
      authService.isAuthenticated.and.returnValue(true);
      
      const roles = ['user', 'moderator', 'administrator'];
      
      roles.forEach(role => {
        authService.hasRole.and.returnValue(true);
        const guard = roleGuard(role);
        
        const result = TestBed.runInInjectionContext(() => 
          guard(mockRoute, mockState)
        );
        
        expect(result).toBe(true);
        expect(authService.hasRole).toHaveBeenCalledWith(role);
      });
    });
  });
});
