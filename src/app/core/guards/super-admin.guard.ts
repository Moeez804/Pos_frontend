import { inject } from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  if (authService.isSuperAdmin()) {
    return true;
  }

  const tenantId =
    authService.getTenantId();

  if (tenantId) {
    return router.createUrlTree([
      `/${tenantId}/dashboard`
    ]);
  }

  return router.createUrlTree(['/login']);
};
