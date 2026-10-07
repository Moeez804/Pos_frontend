import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { TenantService } from '../tenant.service';
import { Tenant } from '../tenant';
import { BusinessType } from '../business-type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe
  ],
  templateUrl: './tenant-list.html',
  styleUrl: './tenant-list.css'
})
export class TenantList {

  private readonly tenantService =
    inject(TenantService);

  tenants: Tenant[] = [];

  searchTerm = '';

  statusFilter:
    'all' | 'active' | 'inactive' = 'all';

  isLoading = false;

  errorMessage = '';

  readonly businessTypes = [
    {
      value: BusinessType.Retail,
      label: 'Retail'
    },
    {
      value: BusinessType.Restaurant,
      label: 'Restaurant'
    },
    {
      value: BusinessType.Pharmacy,
      label: 'Pharmacy'
    },
    {
      value: BusinessType.Wholesale,
      label: 'Wholesale'
    }
  ];

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.tenantService.getAll().subscribe({
      next: (response) => {

        this.tenants = response;

        this.isLoading = false;
      },

      error: () => {

        this.isLoading = false;

        this.errorMessage =
          'Unable to load tenants.';
      }
    });
  }

  get filteredTenants(): Tenant[] {

    const search =
      this.searchTerm.trim().toLowerCase();

    return this.tenants.filter(tenant => {

      const matchesSearch =
        !search ||
        tenant.name
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' &&
          tenant.isActive) ||
        (this.statusFilter === 'inactive' &&
          !tenant.isActive);
      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }

  getBusinessTypeName(
    type: BusinessType
  ): string {

    switch (type) {

      case BusinessType.Retail:
        return 'Retail';

      case BusinessType.Restaurant:
        return 'Restaurant';

      case BusinessType.Pharmacy:
        return 'Pharmacy';

      case BusinessType.Wholesale:
        return 'Wholesale';

      default:
        return 'Unknown';
    }
  }

  toggleStatus(tenant: Tenant): void {

    const newStatus =
      !tenant.isActive;

    this.tenantService
      .setStatus(
        tenant.id,
        newStatus
      )
      .subscribe({

        next: () => {

          tenant.isActive =
            newStatus;
        },

        error: () => {

          this.errorMessage =
            'Unable to update tenant status.';
        }
      });
  }

  clearFilters(): void {

    this.searchTerm = '';

    this.statusFilter = 'all';
  }
}