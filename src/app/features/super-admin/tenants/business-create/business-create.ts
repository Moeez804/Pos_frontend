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

import { API_URL } from '../../../../core/config/api.config';

@Component({
  selector: 'app-business-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './business-create.html',
  styleUrl: './business-create.css'
})
export class BusinessCreate {

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tenantId = 0;

  name = '';
  businessType: number | null = null;
  description = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  readonly businessTypes = [
    {
      value: 1,
      label: 'Retail'
    },
    {
      value: 2,
      label: 'Restaurant'
    },
    {
      value: 3,
      label: 'Pharmacy'
    },
    {
      value: 4,
      label: 'Wholesale'
    }
  ];

  constructor() {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (id > 0) {
      this.tenantId = id;
    } else {
      this.errorMessage = 'Invalid tenant ID.';
    }
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    if (this.tenantId <= 0) {
      this.errorMessage = 'Invalid tenant ID.';
      return;
    }

    if (this.businessType === null) {
      this.errorMessage =
        'Please select a business type.';
      return;
    }

    const request = {
      name: this.name.trim(),
      businessType: this.businessType,
      description: this.description.trim() || null
    };

    this.isLoading = true;

    this.http
      .post(
        `${API_URL}/SuperAdmin/tenants/${this.tenantId}/businesses`,
        request
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage =
            'Business created successfully.';

          setTimeout(() => {
            this.router.navigate([
              '/superadmin/tenants',
              this.tenantId
            ]);
          }, 700);
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 400) {
            this.errorMessage =
              error.error ||
              'Unable to create business. Business name may already exist.';
          } else if (error.status === 404) {
            this.errorMessage =
              'Tenant not found.';
          } else {
            this.errorMessage =
              'Unable to create business. Please try again.';
          }
        }
      });
  }

  cancel(): void {
    this.router.navigate([
      '/superadmin/tenants',
      this.tenantId
    ]);
  }
}
