import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  currentUser = this.authService.getCurrentUser();
  
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  changingPassword = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.toastService.error('Please fill in all password fields');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.toastService.error('New passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.toastService.error('New password must be at least 6 characters');
      return;
    }

    this.changingPassword = true;

    this.http.put<PasswordChangeResponse>('/api/auth/change-password', {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (response) => {
        this.changingPassword = false;
        if (response.success) {
          this.toastService.success(response.message || 'Password changed successfully');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.toastService.error(response.message || 'Failed to change password');
        }
      },
      error: (error) => {
        this.changingPassword = false;
        const errorMessage = error.error?.message || 'Failed to change password';
        this.toastService.error(errorMessage);
      }
    });
  }
}
