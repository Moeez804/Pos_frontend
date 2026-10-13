import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  isSuperAdmin = false;
  isAdmin = false;
  isManager = false;

  isSidebarOpen = false;
  isProfileMenuOpen = false;

  tenantId: number | null = null;
  userInitials = 'U';

ngOnInit(): void {
  this.isSuperAdmin =
    this.authService.isSuperAdmin();

  this.isAdmin =
    this.authService.isAdmin();

  this.isManager =
    this.authService.isManager();

  this.tenantId =
    this.authService.getTenantId();

  const username =
    this.authService.getUsername();

  if (username) {
    this.userInitials =
      username.substring(0, 2).toUpperCase();
  }
}
  toggleSidebar(): void {
    this.isSidebarOpen =
      !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen =
      !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  getDashboardRoute(): string {
    if (this.isSuperAdmin) {
      return '/superadmin';
    }

    if (this.tenantId !== null) {
      return `/${this.tenantId}/dashboard`;
    }

    return '/login';
  }

  getCategoriesRoute(): string {
    if (this.tenantId !== null) {
      return `/${this.tenantId}/categories`;
    }

    return '/login';
  }
    getProductsRoute(): string {
  if (this.tenantId !== null) {
    return `/${this.tenantId}/products`;
  }

  return '/login';
}

  getChangePasswordRoute(): string {
    if (this.tenantId !== null) {
      return `/${this.tenantId}/change-password`;
    }

    return '/login';
  }
  logout(): void {
    const tenantId =
      this.authService.getTenantId();

    const wasSuperAdmin =
      this.authService.isSuperAdmin();

    this.authService.logout();

    if (
      !wasSuperAdmin &&
      tenantId !== null
    ) {
      this.router.navigate([
        `/${tenantId}/login`
      ]);

      return;
    }

    this.router.navigate(['/login']);
  }
}
