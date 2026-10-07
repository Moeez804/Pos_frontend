import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  BranchCategory,
  Category,
  CreateCategoryRequest
} from './category';

import { API_URL } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${API_URL}/Category`;

  // Admin + Manager
  createCategory(
    request: CreateCategoryRequest
  ): Observable<Category> {
    return this.http.post<Category>(
      this.apiUrl,
      request
    );
  }

  // Admin only
  addExistingToBranch(
    categoryId: number,
    branchId: number
  ): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/${categoryId}/branches/${branchId}`,
      {}
    );
  }

  // Admin + Manager
  getByBranch(
    branchId: number
  ): Observable<Category[]> {
    return this.http.get<Category[]>(
      `${this.apiUrl}/branch/${branchId}`
    );
  }
updateBranchStatus(
  categoryId: number,
  branchId: number,
  isActive: boolean
): Observable<{ message: string }> {
  return this.http.put<{ message: string }>(
    `${this.apiUrl}/${categoryId}/branches/${branchId}/status`,
    isActive
  );
}
updateAllBranchesStatus(
  categoryId: number,
  isActive: boolean
): Observable<{ message: string }> {
  return this.http.put<{ message: string }>(
    `${this.apiUrl}/${categoryId}/status/all`,
    isActive
  );
}

  // Admin only
  getAll(): Observable<BranchCategory[]> {
    return this.http.get<BranchCategory[]>(
      `${this.apiUrl}/all`
    );
  }
}