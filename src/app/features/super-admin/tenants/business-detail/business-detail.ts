import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute,Router,RouterLink} from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { API_URL } from '../../../../core/config/api.config';

interface BranchDetails {
  id: number;
  businessId: number;
  name: string;
  address: string | null;
  phone: string | null;
  isMainBranch: boolean;
  isActive: boolean;
  createdAt: string;
}

interface BusinessDetails {
  id: number;
  name: string;
  businessType: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  branches: BranchDetails[];
}

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './business-detail.html',
  styleUrl: './business-detail.css'
})
export class BusinessDetail implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  tenantId = 0;
  businessId = 0;

  business: BusinessDetails | null = null;

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.tenantId = Number(
      this.route.snapshot.paramMap.get('tenantId')
    );

    this.businessId = Number(
      this.route.snapshot.paramMap.get('businessId')
    );

    if (this.tenantId <= 0 || this.businessId <= 0) {
      this.errorMessage =
        'Invalid tenant or business ID.';
      return;
    }

    this.loadBusiness();
  }

  private loadBusiness(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http
      .get<BusinessDetails>(
        `${API_URL}/SuperAdmin/tenants/${this.tenantId}/businesses/${this.businessId}`
      )
      .subscribe({
        next: (business) => {
          this.business = business;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;

          if (error.status === 404) {
            this.errorMessage =
              'Business not found.';
          } else {
            this.errorMessage =
              'Unable to load business details.';
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

addBranch(): void { 
  this.router.navigate([ '/superadmin/tenants', this.tenantId, 'businesses', this.businessId, 'branches', 'create' ]); }
}