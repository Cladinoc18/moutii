import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // If user is logged in but not admin, or not logged in:
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: '/admin', error: 'unauthorized' },
  });
};

