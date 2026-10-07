import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import {
  TenantService
} from '../tenant.service';

interface TenantDatabase {
  databaseName: string;
  serverName: string;
  isActive: boolean;
}

interface TenantAdministrator {
  username: string;
  fullName: string;
  isActive: boolean;
}

interface BusinessDetails {
  id: number;
  name: string;
  businessType: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

interface TenantDetails {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  database: TenantDatabase | null;
  administrator: TenantAdministrator | null;
  businesses: BusinessDetails[];
}

@Component({
  selector: 'app-tenant-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './tenant-detail.html',
  styleUrl: './tenant-detail.css'
})
export class TenantDetail implements OnInit {

  private readonly tenantService = inject(TenantService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tenant: TenantDetails | null = null;

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const tenantId = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (!tenantId) {
      this.errorMessage = 'Invalid tenant ID.';
      return;
    }

    this.loadTenant(tenantId);
  }

  private loadTenant(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tenantService
      .getById(id)
      .subscribe({
        next: (tenant) => {
          this.tenant = tenant as TenantDetails;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 404) {
            this.errorMessage = 'Tenant not found.';
          } else {
            this.errorMessage =
              'Unable to load tenant details.';
          }
        }
      });
  }

  getBusinessTypeName(type: number): string {
    switch (type) {
      case 1:
        return 'Retail';

      case 2:
        return 'Restaurant';

      case 3:
        return 'Pharmacy';

      case 4:
        return 'Wholesale';

      default:
        return 'Unknown';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  createBusiness(): void {
    if (!this.tenant) {
      return;
    }

    this.router.navigate([
      '/superadmin/tenants',
      this.tenant.id,
      'businesses',
      'create'
    ]);
  }
}