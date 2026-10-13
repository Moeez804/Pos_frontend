import {Component,inject,OnInit} from '@angular/core';
import { FormsModule} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {ProductService} from '../product.service';
import { CreateProductRequest, BranchProductRequest} from '../product';
import {CategoryService} from '../../categories/category.service';
import { Category} from '../../categories/category';
import {BranchService} from '../../branches/branch.service';
import { Branch} from '../../branches/branch';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './product-create.html',
  styleUrl: './product-create.css'
})
export class ProductCreate implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly branchService =
    inject(BranchService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);
  name = '';
  sku = '';
  barcode = '';
  description = '';
  unit = 'Piece';
  costPrice: number | null = null;
  salePrice: number | null = null;
  taxRate: number | null = 0;
  categories: Category[] = [];
  categoryId: number | null = null;
  branches: Branch[] = [];
  selectedBranches:
    BranchProductRequest[] = [];

  isAdmin = false;
  isManager = false;
  tenantId: number | null = null;
  businessId: number | null = null;
  managerBranchId: number | null = null;
  isLoadingCategories = false;
  isLoadingBranches = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {

    this.isAdmin =
      this.authService.isAdmin();

    this.isManager =
      this.authService.isManager();

    this.tenantId =
      this.authService.getTenantId();

    this.businessId =
      this.authService.getBusinessId();

    this.managerBranchId =
      this.authService.getBranchId();


    if (this.businessId === null) {

      this.errorMessage =
        'Business information is missing.';

      return;
    }


    this.loadCategories();

    this.loadBranches();
  }
loadCategories(): void {

  this.isLoadingCategories = true;

  this.errorMessage = '';

  if (this.isAdmin) {

    this.categoryService
      .getAll()
      .subscribe({

        next: (response) => {

          const categoryMap =
            new Map<number, Category>();

          for (const branch of response) {

            for (const category of branch.categories) {

              if (
                category.isActive &&
                !categoryMap.has(category.id)
              ) {

                categoryMap.set(
                  category.id,
                  category
                );
              }
            }
          }

          this.categories =
            Array.from(
              categoryMap.values()
            ).sort(
              (a, b) =>
                a.name.localeCompare(b.name)
            );

          this.isLoadingCategories =
            false;
        },

        error: (error) => {

          console.error(
            'Failed to load categories:',
            error
          );

          this.isLoadingCategories =
            false;

          this.errorMessage =
            'Unable to load categories.';
        }

      });

    return;
  }

  // Manager can access categories
  // only from his own branch.
  if (
    this.isManager &&
    this.managerBranchId !== null
  ) {

    this.categoryService
      .getByBranch(
        this.managerBranchId
      )
      .subscribe({

        next: (response) => {

          this.categories =
            response
              .filter(
                category =>
                  category.isActive
              )
              .sort(
                (a, b) =>
                  a.name.localeCompare(b.name)
              );

          this.isLoadingCategories =
            false;
        },

        error: (error) => {

          console.error(
            'Failed to load categories:',
            error
          );

          this.isLoadingCategories =
            false;

          this.errorMessage =
            'Unable to load categories.';
        }

      });

    return;
  }

  this.categories = [];

  this.isLoadingCategories = false;

  this.errorMessage =
    'Unable to determine user branch.';
}

  loadBranches(): void {

    if (this.businessId === null) {

      return;
    }

    this.isLoadingBranches = true;

    this.branchService
      .getAll(
        this.businessId
      )
      .subscribe({

        next: (response) => {

          this.branches =
            response.filter(
              branch =>
                branch.isActive
            );


          // Manager
          // Only own branch

          if (this.isManager) {

            if (
              this.managerBranchId === null
            ) {

              this.errorMessage =
                'Branch information is missing.';

              this.isLoadingBranches =
                false;

              return;
            }


            this.branches =
              this.branches.filter(
                branch =>
                  branch.id ===
                  this.managerBranchId
              );


            if (this.branches.length > 0) {

              this.selectedBranches = [
                {
                  branchId:
                    this.branches[0].id,

                  reorderLevel: 0
                }
              ];
            }

            this.isLoadingBranches =
              false;

            return;
          }


          // Admin
          // Main branch selected by default

          const mainBranch =
            this.branches.find(
              branch =>
                branch.isMainBranch
            );


          if (mainBranch) {

            this.selectedBranches = [
              {
                branchId:
                  mainBranch.id,

                reorderLevel: 0
              }
            ];
          }

          this.isLoadingBranches =
            false;
        },

        error: (error) => {

          console.error(
            'Failed to load branches:',
            error
          );

          this.isLoadingBranches =
            false;

          this.errorMessage =
            'Unable to load branches.';
        }

      });
  }

  isBranchSelected(
    branchId: number
  ): boolean {

    return this.selectedBranches
      .some(
        branch =>
          branch.branchId === branchId
      );
  }


  toggleBranch(
    branch: Branch
  ): void {

    const index =
      this.selectedBranches.findIndex(
        selected =>
          selected.branchId ===
          branch.id
      );


    if (index >= 0) {

      // Manager cannot remove
      // their own branch.

      if (this.isManager) {
        return;
      }

      this.selectedBranches
        .splice(index, 1);

      return;
    }


    this.selectedBranches.push({

      branchId:
        branch.id,

      reorderLevel: 0
    });
  }

  getReorderLevel(
    branchId: number
  ): number {

    const branch =
      this.selectedBranches.find(
        selected =>
          selected.branchId === branchId
      );


    return branch?.reorderLevel ?? 0;
  }

  setReorderLevel(
    branchId: number,
    value: number
  ): void {

    const branch =
      this.selectedBranches.find(
        selected =>
          selected.branchId === branchId
      );


    if (!branch) {
      return;
    }


    branch.reorderLevel =
      value < 0
        ? 0
        : value;
  }


  onBarcodeKeydown(
    event: KeyboardEvent
  ): void {

    if (event.key === 'Enter') {

      event.preventDefault();

      event.stopPropagation();
    }
  }

  createProduct(): void {

    this.errorMessage = '';

    this.successMessage = '';


    const name =
      this.name.trim();


    const sku =
      this.sku.trim();


    const barcode =
      this.barcode.trim();


    const description =
      this.description.trim();
    if (!name) {

      this.errorMessage =
        'Product name is required.';

      return;
    }


    if (this.categoryId === null) {

      this.errorMessage =
        'Category is required.';

      return;
    }


    if (
      this.costPrice === null ||
      this.costPrice < 0
    ) {

      this.errorMessage =
        'Valid cost price is required.';

      return;
    }


    if (
      this.salePrice === null ||
      this.salePrice < 0
    ) {

      this.errorMessage =
        'Valid sale price is required.';

      return;
    }


    if (
      this.taxRate === null ||
      this.taxRate < 0
    ) {

      this.errorMessage =
        'Valid tax rate is required.';

      return;
    }


    if (
      this.selectedBranches.length === 0
    ) {

      this.errorMessage =
        'At least one branch must be selected.';

      return;
    }

    const request:
      CreateProductRequest = {

      categoryId:
        this.categoryId,

      name:
        name,

      sku:
        sku || undefined,

      barcode:
        barcode || undefined,

      description:
        description || undefined,

      unit:
        this.unit.trim() ||
        'Piece',

      costPrice:
        this.costPrice,

      salePrice:
        this.salePrice,

      taxRate:
        this.taxRate,

      branches:
        this.selectedBranches
          .map(branch => ({
            branchId:
              branch.branchId,

            reorderLevel:
              branch.reorderLevel
          }))
    };

    this.isSaving = true;


    this.productService
      .createProduct(request)
      .subscribe({

        next: () => {

          this.isSaving = false;

          this.successMessage =
            'Product created successfully.';


          this.resetForm();
        },

        error: (error) => {

          console.error(
            'Failed to create product:',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            error?.error ||
            error?.error?.message ||
            'Unable to create product.';
        }

      });
  }
  resetForm(): void {

    this.name = '';
    this.sku = '';
    this.barcode = '';
    this.description = '';
    this.unit = 'Piece';
    this.costPrice = null;
    this.salePrice = null;
    this.taxRate = 0;
    this.categoryId = null;
    if (this.isManager) {

      if (
        this.managerBranchId !== null
      ) {

        this.selectedBranches = [
          {
            branchId:
              this.managerBranchId,

            reorderLevel: 0
          }
        ];
      }

      return;
    }


    const mainBranch =
      this.branches.find(
        branch =>
          branch.isMainBranch
      );


    this.selectedBranches =
      mainBranch
        ? [
            {
              branchId:
                mainBranch.id,

              reorderLevel: 0
            }
          ]
        : [];
  }
    createCategoriesRoute(): string {
    if (this.tenantId !== null) {
      return `/${this.tenantId}/categories/create`;
    }

    return '/login';
  }
  goBack(): void {

    if (
      this.tenantId !== null
    ) {

      this.router.navigate([
        `/${this.tenantId}/products`
      ]);

      return;
    }


    this.router.navigate([
      '/login'
    ]);
  }
}
