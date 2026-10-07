import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../category.service';
import { BranchCategory, Category } from '../category';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList implements OnInit {

  private readonly categoryService =
    inject(CategoryService);

  private readonly authService =
    inject(AuthService);

  branches: BranchCategory[] = [];

  isLoading = false;
  errorMessage = '';

  isAdmin = false;
  isManager = false;

  tenantId: number | null = null;

  updatingCategoryId: number | null = null;
  updatingBranchId: number | null = null;

  updatingAllCategoryId: number | null = null;

  ngOnInit(): void {
    this.isAdmin =
      this.authService.isAdmin();

    this.isManager =
      this.authService.isManager();

    this.tenantId =
      this.authService.getTenantId();

    this.loadCategories();
  }

  get totalCategories(): number {
    let total = 0;

    for (const branch of this.branches) {
      total += branch.categories.length;
    }

    return total;
  }

  get activeCategories(): number {
    let total = 0;

    for (const branch of this.branches) {
      for (const category of branch.categories) {
        if (category.isActive) {
          total++;
        }
      }
    }

    return total;
  }

  get inactiveCategories(): number {
    let total = 0;

    for (const branch of this.branches) {
      for (const category of branch.categories) {
        if (!category.isActive) {
          total++;
        }
      }
    }

    return total;
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.isAdmin) {
      this.loadAdminCategories();
      return;
    }

    if (this.isManager) {
      this.loadManagerCategories();
      return;
    }

    this.errorMessage =
      'You do not have permission to view categories.';

    this.isLoading = false;
  }

  createCategoriesRoute(): string {
    if (this.tenantId !== null) {
      return `/${this.tenantId}/categories/create`;
    }

    return '/login';
  }

  updateBranchStatus(
    category: Category,
    branchId: number
  ): void {

    if (
      this.updatingCategoryId !== null ||
      this.updatingAllCategoryId !== null
    ) {
      return;
    }

    const newStatus =
      !category.isActive;

    this.updatingCategoryId =
      category.id;

    this.updatingBranchId =
      branchId;

    this.errorMessage = '';

    this.categoryService
      .updateBranchStatus(
        category.id,
        branchId,
        newStatus
      )
      .subscribe({
        next: () => {
          category.isActive =
            newStatus;

          this.updatingCategoryId =
            null;

          this.updatingBranchId =
            null;
        },

        error: (error) => {
          console.error(
            'Failed to update category status:',
            error
          );

          this.errorMessage =
            error?.error ||
            'Unable to update category status.';

          this.updatingCategoryId =
            null;

          this.updatingBranchId =
            null;
        }
      });
  }
updateAllBranchesStatus(
  category: Category
): void {

  if (!this.isAdmin) {
    return;
  }

  if (
    this.updatingCategoryId !== null ||
    this.updatingAllCategoryId !== null
  ) {
    return;
  }

  const newStatus =
    !category.isActive;

  this.updatingAllCategoryId =
    category.id;

  this.errorMessage = '';

  this.categoryService
    .updateAllBranchesStatus(
      category.id,
      newStatus
    )
    .subscribe({
      next: () => {

        for (const branch of this.branches) {

          for (const branchCategory
            of branch.categories) {

            if (
              branchCategory.id === category.id
            ) {
              branchCategory.isActive =
                newStatus;
            }
          }
        }

        this.updatingAllCategoryId = null;
      },

      error: (error) => {

        console.error(
          'Failed to update category status for all branches:',
          error
        );

        this.errorMessage =
          error?.error ||
          'Unable to update category status for all branches.';

        this.updatingAllCategoryId = null;
      }
    });
}
  private loadAdminCategories(): void {
    this.categoryService.getAll().subscribe({
      next: (response) => {
        this.branches = response;
        this.isLoading = false;
      },

      error: (error) => {
        console.error(
          'Failed to load categories:',
          error
        );

        this.errorMessage =
          'Unable to load categories.';

        this.isLoading = false;
      }
    });
  }

  private loadManagerCategories(): void {
    const branchId =
      this.authService.getBranchId();

    if (branchId === null) {
      this.errorMessage =
        'Branch information is missing.';

      this.isLoading = false;

      return;
    }

    this.categoryService
      .getByBranch(branchId)
      .subscribe({
        next: (categories) => {

          const branch: BranchCategory = {
            branchId: branchId,
            branchName: 'My Branch',
            categories: categories
          };

          this.branches = [branch];

          this.isLoading = false;
        },

        error: (error) => {
          console.error(
            'Failed to load branch categories:',
            error
          );

          this.errorMessage =
            'Unable to load categories.';

          this.isLoading = false;
        }
      });
  }
}