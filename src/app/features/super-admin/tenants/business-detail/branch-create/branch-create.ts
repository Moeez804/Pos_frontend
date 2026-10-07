import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  NgForm
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../../../../core/config/api.config';

@Component({
  selector: 'app-branch-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './branch-create.html',
  styleUrl: './branch-create.css'
})
export class BranchCreate {

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tenantId = 0;
  businessId = 0;

  name = '';
  address = '';
  phone = '';
  isMainBranch = false;

  managerUsername = '';
  managerFullName = '';
  managerPassword = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {

    const tenantId =
      Number(
        this.route.snapshot.paramMap.get('tenantId')
      );

    const businessId =
      Number(
        this.route.snapshot.paramMap.get('businessId')
      );

    if (tenantId > 0) {
      this.tenantId = tenantId;
    }

    if (businessId > 0) {
      this.businessId = businessId;
    }

    if (
      this.tenantId <= 0 ||
      this.businessId <= 0
    ) {
      this.errorMessage =
        'Invalid tenant or business ID.';
    }
  }

  onSubmit(form: NgForm): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (
      this.tenantId <= 0 ||
      this.businessId <= 0
    ) {
      this.errorMessage =
        'Invalid tenant or business ID.';
      return;
    }

    const request = {
      tenantId: this.tenantId,

      businessId: this.businessId,

      name: this.name.trim(),

      address:
        this.address.trim() || null,

      phone:
        this.phone.trim() || null,

      isMainBranch:
        this.isMainBranch,

      managerUsername:
        this.managerUsername.trim(),

      managerFullName:
        this.managerFullName.trim(),

      managerPassword:
        this.managerPassword
    };

    this.isLoading = true;

    this.http
      .post(
        `${API_URL}/Branch`,
        request
      )
      .subscribe({
        next: () => {

          this.isLoading = false;

          this.successMessage =
            'Branch and Manager account created successfully.';

          setTimeout(() => {

            this.router.navigate([
              '/superadmin/tenants',
              this.tenantId,
              'businesses',
              this.businessId
            ]);

          }, 700);
        },

        error: (error) => {

          this.isLoading = false;

          if (error.status === 400) {

            this.errorMessage =
              error.error ||
              'Unable to create branch. Branch name or Manager username may already exist.';

          } else if (error.status === 404) {

            this.errorMessage =
              'Business not found.';

          } else {

            this.errorMessage =
              'Unable to create branch. Please try again.';
          }
        }
      });
  }

  cancel(): void {

    this.router.navigate([
      '/superadmin/tenants',
      this.tenantId,
      'businesses',
      this.businessId
    ]);
  }
}