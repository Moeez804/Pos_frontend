import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../product.service';
import { Product } from '../product';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly authService =
    inject(AuthService);

  private readonly router =
    inject(Router);

  products: Product[] = [];

  searchTerm = '';

  isLoading = false;
  isDeleting = false;

  deletingProductId: number | null = null;

  errorMessage = '';
  successMessage = '';

  tenantId: number | null = null;

  isAdmin = false;
  isManager = false;

  ngOnInit(): void {
    this.tenantId =
      this.authService.getTenantId();

    this.isAdmin =
      this.authService.isAdmin();

    this.isManager =
      this.authService.isManager();

    this.loadProducts();
  }

  loadProducts(): void {

    this.isLoading = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.productService.getAll().subscribe({

      next: (response) => {

        this.products = response;

        this.isLoading = false;
      },

      error: (error) => {

        console.error(
          'Failed to load products:',
          error
        );

        this.errorMessage =
          error?.error?.message ||
          'Unable to load products. Please try again.';

        this.isLoading = false;
      }

    });
  }

  get filteredProducts(): Product[] {

    const search =
      this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.products;
    }

    return this.products.filter(product => {

      const name =
        product.name?.toLowerCase() ?? '';

      const category =
        product.categoryName?.toLowerCase() ?? '';

      const sku =
        product.sku?.toLowerCase() ?? '';

      const barcode =
        product.barcode?.toLowerCase() ?? '';

      return (
        name.includes(search) ||
        category.includes(search) ||
        sku.includes(search) ||
        barcode.includes(search)
      );

    });
  }

  get totalProducts(): number {
    return this.products.length;
  }
  get activeProducts(): number {
  return this.products.filter(
    product => product.isActive
  ).length;
}

get inactiveProducts(): number {
  return this.products.filter(
    product => !product.isActive
  ).length;
}

  get totalAssignedBranches(): number {

    return this.products.reduce(
      (total, product) =>
        total + product.branches.length,
      0
    );
  }

  getCreateProductRoute(): string {

    if (this.tenantId !== null) {
      return `/${this.tenantId}/products/create`;
    }

    return '/login';
  }

  getCategoriesRoute(): string {

    if (this.tenantId !== null) {
      return `/${this.tenantId}/categories`;
    }

    return '/login';
  }

  getBranchNames(product: Product): string {

    if (!product.branches?.length) {
      return 'No branches assigned';
    }

    return product.branches
      .map(branch => branch.branchName)
      .join(', ');
  }

  deleteProduct(product: Product): void {

    if (this.isDeleting) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;
    this.deletingProductId = product.id;

    this.errorMessage = '';
    this.successMessage = '';

    this.productService
      .deleteProduct(product.id)
      .subscribe({

        next: (response) => {

          this.products =
            this.products.filter(
              item => item.id !== product.id
            );

          this.successMessage =
            response?.message ||
            'Product deactivated successfully.';

          this.isDeleting = false;
          this.deletingProductId = null;
        },

        error: (error) => {

          console.error(
            'Failed to deactivate product:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            error?.error ||
            'Unable to deactivate product. Please try again.';

          this.isDeleting = false;
          this.deletingProductId = null;
        }

      });
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  goBack(): void {

    if (this.tenantId !== null) {
      this.router.navigate([
        `/${this.tenantId}/dashboard`
      ]);

      return;
    }

    this.router.navigate(['/login']);
  }
}