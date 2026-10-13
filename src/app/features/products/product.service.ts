import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Product,
  CreateProductRequest
} from './product';

import { API_URL } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_URL}/Product`;

  createProduct(
    request: CreateProductRequest
  ): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl,
      request
    );
  }

  getAll(): Observable<Product[]> {

    return this.http.get<Product[]>(
      this.apiUrl
    );
  }

  getById(
    id: number
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.apiUrl}/${id}`
    );
  }

  updateProduct(
    id: number,
    request: CreateProductRequest
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deleteProduct(
    id: number
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}