import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../../../core/config/api.config';
import { Tenant } from './tenant';

export interface DatabaseServer {
  id: number;
  name: string;
  serverAddress: string;
  isActive: boolean;
}

export interface TenantDatabase {
  databaseName: string;
  serverName: string;
  isActive: boolean;
}

export interface TenantAdministrator {
  username: string;
  fullName: string;
  isActive: boolean;
}

export interface BusinessDetails {
  id: number;
  name: string;
  businessType: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface TenantDetails {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  userCount: number;
  database: TenantDatabase | null;
  administrator: TenantAdministrator | null;
  businesses: BusinessDetails[];
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${API_URL}/SuperAdmin/tenants`;

  getAll(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(
      this.apiUrl
    );
  }

  getById(id: number): Observable<TenantDetails> {
    return this.http.get<TenantDetails>(
      `${this.apiUrl}/${id}`
    );
  }

  getDatabaseServers(): Observable<DatabaseServer[]> {
    return this.http.get<DatabaseServer[]>(
      `${API_URL}/DatabaseServer`
    );
  }

  create(request: {
    name: string;
    adminUsername: string;
    adminFullName: string;
    adminPassword: string;
    databaseServerId: number;
  }): Observable<Tenant> {
    return this.http.post<Tenant>(
      this.apiUrl,
      request
    );
  }

  setStatus(
    id: number,
    isActive: boolean
  ): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${id}/status?isActive=${isActive}`,
      {}
    );
  }
}