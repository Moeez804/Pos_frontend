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

  private readonly categoryService = inject(CategoryService);
  private readonly authService = inject(AuthService);

  branches: BranchCategory[] = [];
pageSizeOptions: number[] = [5, 10, 25, 50];
pageSizes: Record<number, number> = {};
currentPages: Record<number, number> = {};

getPageSize(branchId: number): number {
  return this.pageSizes[branchId] ?? 5;
}

getCurrentPage(branchId: number): number {
  return this.currentPages[branchId] ?? 1;
}

getTotalPages(branch: BranchCategory): number {
  const pageSize = this.getPageSize(branch.branchId);

  if (pageSize === 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.ceil(branch.categories.length / pageSize)
  );
}

getPaginatedCategories(branch: BranchCategory): Category[] {
  const branchId = branch.branchId;
  const pageSize = this.getPageSize(branchId);

  if (pageSize === 0) {
    return branch.categories;
  }

  const currentPage = Math.min(
    this.getCurrentPage(branchId),
    this.getTotalPages(branch)
  );

  const startIndex = (currentPage - 1) * pageSize;

  return branch.categories.slice(
    startIndex,
    startIndex + pageSize
  );
}

getStartIndex(branch: BranchCategory): number {
  if (branch.categories.length === 0) {
    return 0;
  }

  if (this.getPageSize(branch.branchId) === 0) {
    return 1;
  }

  return (
    (this.getCurrentPage(branch.branchId) - 1) *
      this.getPageSize(branch.branchId)
  ) + 1;
}

getEndIndex(branch: BranchCategory): number {
  const pageSize = this.getPageSize(branch.branchId);

  if (pageSize === 0) {
    return branch.categories.length;
  }

  return Math.min(
    this.getCurrentPage(branch.branchId) * pageSize,
    branch.categories.length
  );
}

changePageSize(branchId: number, value: string): void {
  const pageSize = Number(value);

  this.pageSizes[branchId] = pageSize;
  this.currentPages[branchId] = 1;
}

goToPage(branch: BranchCategory, page: number): void {
  const totalPages = this.getTotalPages(branch);

  if (page < 1 || page > totalPages) {
    return;
  }

  this.currentPages[branch.branchId] = page;
}

  isLoading = false;
  errorMessage = '';

  isAdmin = false;
  isManager = false;

  tenantId: number | null = null;

  updatingCategoryId: number | null = null;
  updatingBranchId: number | null = null;
  updatingAllCategoryId: number | null = null;

  // Add existing category to branch
  activeAddBranchId: number | null = null;
  availableCategories: Category[] = [];
  selectedExistingCategoryId: number | null = null;

  isLoadingAvailableCategories = false;
  isAddingExistingCategory = false;

  addCategoryError = '';
  addCategorySuccess = '';

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isManager = this.authService.isManager();
    this.tenantId = this.authService.getTenantId();

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

  openExistingCategoryPanel(branchId: number): void {
    if (!this.isAdmin) {
      return;
    }

    if (this.isAddingExistingCategory) {
      return;
    }

    // Clicking the same branch button closes the panel.
    if (this.activeAddBranchId === branchId) {
      this.closeExistingCategoryPanel();
      return;
    }

    this.activeAddBranchId = branchId;
    this.availableCategories = [];
    this.selectedExistingCategoryId = null;
    this.addCategoryError = '';
    this.addCategorySuccess = '';
    this.isLoadingAvailableCategories = true;

    this.categoryService
      .getAvailableForBranch(branchId)
      .subscribe({
        next: (categories) => {
          this.availableCategories = categories;
          this.isLoadingAvailableCategories = false;
        },
        error: (error) => {
          console.error(
            'Failed to load available categories:',
            error
          );

          this.addCategoryError =
            error?.error?.message ||
            (typeof error?.error === 'string'
              ? error.error
              : '') ||
            'Unable to load available categories.';

          this.isLoadingAvailableCategories = false;
        }
      });
  }

  closeExistingCategoryPanel(): void {
    if (this.isAddingExistingCategory) {
      return;
    }

    this.activeAddBranchId = null;
    this.availableCategories = [];
    this.selectedExistingCategoryId = null;
    this.addCategoryError = '';
    this.addCategorySuccess = '';
    this.isLoadingAvailableCategories = false;
  }

  addExistingCategory(): void {
    if (!this.isAdmin) {
      return;
    }

    const branchId = this.activeAddBranchId;
    const categoryId = this.selectedExistingCategoryId;

    if (branchId === null || categoryId === null) {
      this.addCategoryError =
        'Please select a category first.';
      return;
    }

    if (this.isAddingExistingCategory) {
      return;
    }

    this.isAddingExistingCategory = true;
    this.addCategoryError = '';
    this.addCategorySuccess = '';

    this.categoryService
      .addExistingToBranch(categoryId, branchId)
      .subscribe({
        next: () => {
          this.addCategorySuccess =
            'Category added to the branch successfully.';

          this.isAddingExistingCategory = false;

          // Refresh the branch/category list from the backend.
          this.loadAdminCategories();

          // Close the panel after the operation succeeds.
          this.activeAddBranchId = null;
          this.availableCategories = [];
          this.selectedExistingCategoryId = null;
        },
        error: (error) => {
          console.error(
            'Failed to add existing category to branch:',
            error
          );

          this.addCategoryError =
            error?.error?.message ||
            (typeof error?.error === 'string'
              ? error.error
              : '') ||
            'Unable to add this category to the branch.';

          this.isAddingExistingCategory = false;
        }
      });
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

    const newStatus = !category.isActive;

    this.updatingCategoryId = category.id;
    this.updatingBranchId = branchId;
    this.errorMessage = '';

    this.categoryService
      .updateBranchStatus(
        category.id,
        branchId,
        newStatus
      )
      .subscribe({
        next: () => {
          category.isActive = newStatus;
          this.updatingCategoryId = null;
          this.updatingBranchId = null;
        },
        error: (error) => {
          console.error(
            'Failed to update category status:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            (typeof error?.error === 'string'
              ? error.error
              : '') ||
            'Unable to update category status.';

          this.updatingCategoryId = null;
          this.updatingBranchId = null;
        }
      });
  }

  updateAllBranchesStatus(category: Category): void {
    if (!this.isAdmin) {
      return;
    }

    if (
      this.updatingCategoryId !== null ||
      this.updatingAllCategoryId !== null
    ) {
      return;
    }

    const newStatus = !category.isActive;

    this.updatingAllCategoryId = category.id;
    this.errorMessage = '';

    this.categoryService
      .updateAllBranchesStatus(category.id, newStatus)
      .subscribe({
        next: () => {
          for (const branch of this.branches) {
            for (const branchCategory of branch.categories) {
              if (branchCategory.id === category.id) {
                branchCategory.isActive = newStatus;
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
            error?.error?.message ||
            (typeof error?.error === 'string'
              ? error.error
              : '') ||
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
    const branchId = this.authService.getBranchId();

    if (branchId === null) {
      this.errorMessage =
        'Branch information is missing.';

      this.isLoading = false;
      return;
    }

    this.categoryService.getByBranch(branchId).subscribe({
      next: (categories) => {
        const branch: BranchCategory = {
          branchId,
          branchName: 'My Branch',
          categories
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
