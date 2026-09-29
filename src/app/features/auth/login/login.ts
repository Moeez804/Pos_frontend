import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
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

  username = '';
  password = '';

  isLoading = false;
  errorMessage = '';

  onLogin(): void {

    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    const request: LoginRequest = {
      username: this.username,
      password: this.password
    };

    this.isLoading = true;

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading = false;

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        this.isLoading = false;

        if (error.status === 401) {
          this.errorMessage =
            'Invalid username or password.';
        } else {
          this.errorMessage =
            'Unable to connect to the server.';
        }
      }
    });
  }
}