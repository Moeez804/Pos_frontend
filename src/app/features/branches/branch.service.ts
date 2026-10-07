import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Branch } from './branch';
import { API_URL } from '../../core/config/api.config';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_URL}/Branch`;

  getAll(
    businessId: number
  ): Observable<Branch[]> {
    return this.http.get<Branch[]>(
      `${this.apiUrl}?businessId=${businessId}`
    );
  }

  getById(
    id: number,
    businessId: number
  ): Observable<Branch> {
    return this.http.get<Branch>(
      `${this.apiUrl}/${id}?businessId=${businessId}`
    );
  }
}