import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpEvent, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let nextHandler: jasmine.Spy;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    nextHandler = jasmine.createSpy('nextHandler');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should add Authorization header when token exists', (done) => {
    const token = 'test-token-123';
    authService.getToken.and.returnValue(token);
    
    const request = new HttpRequest('GET', '/api/users');
    const mockResponse = new HttpResponse({ status: 200, body: {} });
    nextHandler.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe(() => {
        const interceptedRequest = nextHandler.calls.mostRecent().args[0];
        expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
        done();
      });
    });
  });

  it('should not add Authorization header when token is null', (done) => {
    authService.getToken.and.returnValue(null);
    
    const request = new HttpRequest('GET', '/api/public');
    const mockResponse = new HttpResponse({ status: 200, body: {} });
    nextHandler.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe(() => {
        const interceptedRequest = nextHandler.calls.mostRecent().args[0];
        expect(interceptedRequest.headers.has('Authorization')).toBe(false);
        done();
      });
    });
  });

  it('should handle successful requests', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/data');
    const mockResponse = new HttpResponse({ status: 200, body: { data: 'test' } });
    nextHandler.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe(response => {
        expect(response).toBe(mockResponse);
        expect(authService.logout).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should logout and redirect on 401 error', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/protected');
    const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    nextHandler.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
          expect(authService.logout).toHaveBeenCalled();
          expect(router.navigate).toHaveBeenCalledWith(['/login']);
          done();
        }
      });
    });
  });

  it('should not logout on non-401 errors', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/data');
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    nextHandler.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe({
        error: (err) => {
          expect(err.status).toBe(500);
          expect(authService.logout).not.toHaveBeenCalled();
          expect(router.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should handle 404 errors without logout', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/nonexistent');
    const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
    nextHandler.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe({
        error: (err) => {
          expect(err.status).toBe(404);
          expect(authService.logout).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should handle 403 errors without logout', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/admin');
    const error = new HttpErrorResponse({ status: 403, statusText: 'Forbidden' });
    nextHandler.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe({
        error: (err) => {
          expect(err.status).toBe(403);
          expect(authService.logout).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('should preserve original request method', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('POST', '/api/data', { key: 'value' });
    const mockResponse = new HttpResponse({ status: 200, body: {} });
    nextHandler.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe(() => {
        const interceptedRequest = nextHandler.calls.mostRecent().args[0];
        expect(interceptedRequest.method).toBe('POST');
        expect(interceptedRequest.body).toEqual({ key: 'value' });
        done();
      });
    });
  });

  it('should add Authorization header when token exists', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request = new HttpRequest('GET', '/api/data');
    const mockResponse = new HttpResponse({ status: 200, body: {} });
    nextHandler.and.returnValue(of(mockResponse));

    TestBed.runInInjectionContext(() => {
      const result = authInterceptor(request, nextHandler);

      result.subscribe(() => {
        const interceptedRequest = nextHandler.calls.mostRecent().args[0];
        expect(interceptedRequest.headers.get('Authorization')).toBe('Bearer test-token');
        done();
      });
    });
  });

  it('should handle multiple 401 errors correctly', (done) => {
    authService.getToken.and.returnValue('test-token');
    
    const request1 = new HttpRequest('GET', '/api/endpoint1');
    const request2 = new HttpRequest('GET', '/api/endpoint2');
    const error = new HttpErrorResponse({ status: 401 });
    
    nextHandler.and.returnValue(throwError(() => error));

    TestBed.runInInjectionContext(() => {
      const result1 = authInterceptor(request1, nextHandler);
      const result2 = authInterceptor(request2, nextHandler);

      let errorCount = 0;

      result1.subscribe({ error: () => errorCount++ });
      result2.subscribe({ 
        error: () => {
          errorCount++;
          if (errorCount === 2) {
            expect(authService.logout).toHaveBeenCalledTimes(2);
            expect(router.navigate).toHaveBeenCalledTimes(2);
            done();
          }
        }
      });
    });
  });
});
