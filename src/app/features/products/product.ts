export interface BranchProductRequest {
  branchId: number;
  reorderLevel: number;
}

export interface CreateProductRequest {
  categoryId: number;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  taxRate: number;
  branches: BranchProductRequest[];
}

export interface BranchProduct {
  branchId: number;
  branchName: string;
  reorderLevel: number;
  isActive: boolean;
}

export interface Product {
  id: number;
  businessId: number;
  categoryId: number;
  categoryName: string;
  name: string;
  sku?: string;
  barcode?: string;
  description?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  taxRate: number;
  isActive: boolean;
  createdAt: string;
  branches: BranchProduct[];
}