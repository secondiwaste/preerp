import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role guard factory to check if user has required role
 * Usage: canActivate: [roleGuard('administrator')]
 */
export const roleGuard = (requiredRole: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // First check if user is authenticated
    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check if user has required role
    if (authService.hasRole(requiredRole)) {
      return true;
    }

    // User doesn't have required role - redirect to dashboard or unauthorized page
    console.warn('[ROLE GUARD] Access denied - insufficient privileges');
    router.navigate(['/dashboard'], { 
      queryParams: { error: 'insufficient_privileges' } 
    });
    return false;
  };
};

/**
 * Admin only guard
 * Usage: canActivate: [adminGuard]
 */
export const adminGuard: CanActivateFn = roleGuard('administrator');

/**
 * Moderator or higher guard
 * Usage: canActivate: [moderatorGuard]
 */
export const moderatorGuard: CanActivateFn = roleGuard('moderator');
