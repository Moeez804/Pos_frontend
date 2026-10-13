import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {

  private readonly authService =
    inject(AuthService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  isSaving = false;

  errorMessage = '';
  successMessage = '';

  changePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.currentPassword) {
      this.errorMessage =
        'Current password is required.';
      return;
    }

    if (!this.newPassword) {
      this.errorMessage =
        'New password is required.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage =
        'New password and confirm password do not match.';
      return;
    }

    if (this.currentPassword === this.newPassword) {
      this.errorMessage =
        'New password must be different from the current password.';
      return;
    }

    this.isSaving = true;

    this.authService
      .changePassword(
        this.currentPassword,
        this.newPassword
      )
      .subscribe({
        next: (response) => {
          this.isSaving = false;

          this.successMessage =
            response.message ||
            'Password changed successfully.';

          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        },

        error: (error) => {
          console.error(
            'Failed to change password:',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to change password. Please verify your current password.';
        }
      });
  }
}
