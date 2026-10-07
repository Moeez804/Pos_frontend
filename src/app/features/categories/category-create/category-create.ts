import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CategoryService } from '../category.service';
import { CreateCategoryRequest } from '../category';

import { AuthService } from '../../../core/services/auth.service';
import { BranchService } from '../../branches/branch.service';
import { Branch } from '../../branches/branch';

@Component({
  selector: 'app-category-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './category-create.html',
  styleUrl: './category-create.css'
})
export class CategoryCreate implements OnInit {

  private readonly categoryService =
    inject(CategoryService);

  private readonly branchService =
    inject(BranchService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  name = '';
  description = '';

  branchId: number | null = null;

  branches: Branch[] = [];

  isAdmin = false;
  isManager = false;

  isLoadingBranches = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  tenantId: number | null = null;

  ngOnInit(): void {
    this.isAdmin =
      this.authService.isAdmin();

    this.isManager =
      this.authService.isManager();

    this.tenantId =
      this.authService.getTenantId();

    if (this.isAdmin) {
      this.loadBranches();
      return;
    }

    if (this.isManager) {
      this.branchId =
        this.authService.getBranchId();

      if (this.branchId === null) {
        this.errorMessage =
          'Branch information is missing.';
      }
    }
  }

  loadBranches(): void {
    this.isLoadingBranches = true;
    this.errorMessage = '';
const businessId =
  this.authService.getBusinessId();

if (businessId === null) {
  this.errorMessage =
    'Business information is missing.';

  this.isLoadingBranches = false;
  return;
}

this.branchService.getAll(businessId).subscribe({
  next: (response) => {
    this.branches = response.filter(
      branch => branch.isActive
    );

    this.isLoadingBranches = false;
  },

  error: (error) => {
    console.error(
      'Failed to load branches:',
      error
    );

    this.errorMessage =
      'Unable to load branches.';

    this.isLoadingBranches = false;
  }
});
  }

  createCategory(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const name =
      this.name.trim();

    const description =
      this.description.trim();

    if (!name) {
      this.errorMessage =
        'Category name is required.';

      return;
    }

    if (this.branchId === null) {
      this.errorMessage =
        'Branch information is missing.';

      return;
    }

    const request: CreateCategoryRequest = {
      name: name,
      description: description || undefined,
      branchId: this.branchId
    };

    this.isSaving = true;

    this.categoryService
      .createCategory(request)
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.successMessage =
            'Category created successfully.';

          this.name = '';
          this.description = '';

          if (this.isAdmin) {
            this.branchId = null;
          }
        },

        error: (error) => {
          console.error(
            'Failed to create category:',
            error
          );

          this.errorMessage =
            error?.error ||
            'Unable to create category.';

          this.isSaving = false;
        }
      });
  }

  goBack(): void {
    if (this.tenantId !== null) {
      this.router.navigate([
        `/${this.tenantId}/categories`
      ]);

      return;
    }

    this.router.navigate(['/login']);
  }
}