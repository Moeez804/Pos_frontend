import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  AuthService,
  LoginRequest
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  tenantId: number | null = null;

  username = '';
  password = '';

  isLoading = false;
  errorMessage = '';

  constructor() {
    const tenantId =
      Number(
        this.route.snapshot.paramMap.get('tenantId')
      );

    if (tenantId > 0) {
      this.tenantId = tenantId;
    }
  }

  onLogin(): void {

    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage =
        'Username and password are required.';
      return;
    }

    const request: LoginRequest = {
      tenantId: this.tenantId,
      username: this.username,
      password: this.password
    };

    this.isLoading = true;

    this.authService.login(request).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.roles.includes('SuperAdmin')) {
          this.router.navigate([
            '/superadmin'
          ]);
          return;
        }

        if (!response.tenantId) {
          this.errorMessage =
            'Tenant information is missing.';
          return;
        }

        this.router.navigate([
          `/${response.tenantId}/dashboard`
        ]);
      },

      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Invalid username, password, or tenant.';
        } else {
          this.errorMessage =
            'Unable to connect to the server.';
        }
      }
    });
  }
}