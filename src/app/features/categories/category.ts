export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BranchCategory {
  branchId: number;
  branchName: string;
  categories: Category[];
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  branchId: number;
}