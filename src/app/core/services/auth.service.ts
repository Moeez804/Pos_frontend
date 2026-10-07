import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { API_URL } from '../config/api.config';

export interface LoginRequest {
  tenantId: number | null;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  tenantId: number | null;
  branchId: number | null;
  businessId: number | null;
  username: string;
  fullName: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = API_URL;

  private readonly tokenKey = 'pos_token';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/Auth/login`,
        request
      )
      .pipe(
        tap(response => {
          localStorage.setItem(
            this.tokenKey,
            response.token
          );
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getTokenPayload(): any | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      return JSON.parse(
        atob(token.split('.')[1])
      );
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const payload = this.getTokenPayload();

    if (!payload) {
      return [];
    }

    const roleClaim =
      payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];

    if (!roleClaim) {
      return [];
    }

    return Array.isArray(roleClaim)
      ? roleClaim
      : [roleClaim];
  }

  isSuperAdmin(): boolean {
    return this.getRoles().includes('SuperAdmin');
  }

  isTenantAdmin(): boolean {
    return this.getRoles().includes('TenantAdmin');
  }

  isAdmin(): boolean {
    return this.getRoles().includes('Admin');
  }

  isManager(): boolean {
    return this.getRoles().includes('Manager');
  }

  isCashier(): boolean {
    return this.getRoles().includes('Cashier');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getTenantId(): number | null {
    const payload = this.getTokenPayload();

    if (!payload?.['tenantId']) {
      return null;
    }

    return Number(payload['tenantId']);
  }

  getBranchId(): number | null {
    const payload = this.getTokenPayload();

    if (!payload?.['branchId']) {
      return null;
    }

    return Number(payload['branchId']);
  }
  getBusinessId(): number | null { const payload = this.getTokenPayload(); if (!payload?.['businessId']) { return null; } return Number(payload['businessId']); }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}