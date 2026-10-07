import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  TenantService,
  DatabaseServer
} from '../tenant.service';

@Component({
  selector: 'app-tenant-create',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './tenant-create.html',
  styleUrl: './tenant-create.css'
})
export class TenantCreate implements OnInit {

  private readonly tenantService =
    inject(TenantService);

  private readonly router =
    inject(Router);

  tenantName = '';

  databaseServerId: number | null = null;

  databaseServers: DatabaseServer[] = [];

  adminUsername = '';

  adminFullName = '';

  adminPassword = '';

  confirmPassword = '';

  isLoading = false;

  isLoadingServers = false;

  errorMessage = '';

  successMessage = '';

  ngOnInit(): void {
    this.loadDatabaseServers();
  }

  private loadDatabaseServers(): void {

    this.isLoadingServers = true;

    this.tenantService
      .getDatabaseServers()
      .subscribe({

        next: (servers) => {

          this.databaseServers = servers;

          if (servers.length === 1) {
            this.databaseServerId =
              servers[0].id;
          }

          this.isLoadingServers = false;
        },

        error: () => {

          this.isLoadingServers = false;

          this.errorMessage =
            'Unable to load database servers.';
        }

      });
  }

  onSubmit(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.tenantName.trim()) {
      this.errorMessage =
        'Tenant name is required.';
      return;
    }

    if (this.databaseServerId === null) {
      this.errorMessage =
        'Please select a database server.';
      return;
    }

    if (!this.adminUsername.trim()) {
      this.errorMessage =
        'Tenant admin username is required.';
      return;
    }

    if (!this.adminFullName.trim()) {
      this.errorMessage =
        'Tenant admin full name is required.';
      return;
    }

    if (!this.adminPassword) {
      this.errorMessage =
        'Tenant admin password is required.';
      return;
    }

    if (this.adminPassword.length < 6) {
      this.errorMessage =
        'Password must be at least 6 characters.';
      return;
    }

    if (
      this.adminPassword !==
      this.confirmPassword
    ) {
      this.errorMessage =
        'Passwords do not match.';
      return;
    }

    const request = {
      name: this.tenantName.trim(),

      databaseServerId:
        this.databaseServerId,

      adminUsername:
        this.adminUsername.trim(),

      adminFullName:
        this.adminFullName.trim(),

      adminPassword:
        this.adminPassword
    };

    this.isLoading = true;

    this.tenantService
      .create(request)
      .subscribe({

        next: () => {

          this.isLoading = false;

          this.successMessage =
            'Tenant created successfully.';

          setTimeout(() => {

            this.router.navigate([
              '/superadmin/tenants'
            ]);

          }, 700);
        },

        error: (error) => {

          this.isLoading = false;

          if (error.status === 400) {

            this.errorMessage =
              error.error ||
              'Unable to create tenant. Tenant name or username may already exist.';

          } else {

            this.errorMessage =
              'Unable to create tenant.';
          }
        }

      });
  }
}
