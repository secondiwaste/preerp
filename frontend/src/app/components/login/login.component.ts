import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoginMode = true;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const authObservable = this.isLoginMode 
      ? this.authService.login(this.username, this.password)
      : this.authService.register(this.username, this.password);

    authObservable.subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          if (!this.isLoginMode) {
            // Show success toast for registration
            this.toastService.success(response.message || 'Registration successful!', 3000);
          }
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.loading = false;
        
        // Handle validation errors (errors array)
        let errorMsg = 'An error occurred. Please try again.';
        
        if (error.error?.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
          // Extract validation error messages
          errorMsg = error.error.errors.map((e: any) => e.msg).join(', ');
        } else if (error.error?.message) {
          // Handle standard error message
          errorMsg = error.error.message;
        }
        
        this.errorMessage = errorMsg;
        this.toastService.error(errorMsg);
      }
    });
  }
}
