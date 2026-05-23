import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NavbarComponent } from '../navbar/navbar.component';

interface DashboardData {
  success: boolean;
  data: {
    message: string;
    user: User;
  };
}

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  dashboardMessage = '';
  users: User[] = [];
  loading = true;
  loadingUsers = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get isModerator(): boolean {
    return this.authService.isModerator();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
    if (this.isAdmin) {
      this.loadUsers();
    } else {
      this.loadingUsers = false;
    }
  }

  loadDashboardData(): void {
    this.http.get<DashboardData>('/api/dashboard').subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.dashboardMessage = response.data.message;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading dashboard:', error);
        this.toastService.error('Failed to load dashboard data');
      }
    });
  }

  loadUsers(): void {
    this.http.get<UsersResponse>('/api/admin/users').subscribe({
      next: (response) => {
        this.loadingUsers = false;
        if (response.success) {
          this.users = response.data.users;
        }
      },
      error: (error) => {
        this.loadingUsers = false;
        console.error('Error loading users:', error);
        this.toastService.error('Failed to load users');
      }
    });
  }
}
