import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../services/toast.service';
import { User, AuthService } from '../../services/auth.service';

interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
  };
}

interface UpdateLevelResponse {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  showEditModal = false;
  selectedUser: User | null = null;
  newUserLevel: string = 'user';
  updating = false;
  currentUserId: number | undefined;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id;
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<UsersResponse>('/api/admin/users').subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.users = response.data.users;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading users:', error);
        this.toastService.error('Failed to load users');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  openEditModal(user: User): void {
    this.selectedUser = user;
    this.newUserLevel = user.user_level || 'user';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
    this.newUserLevel = 'user';
    this.updating = false;
  }

  saveUserLevel(): void {
    if (!this.selectedUser || this.updating) return;

    if (this.newUserLevel === this.selectedUser.user_level) {
      this.toastService.info('No changes to save');
      return;
    }

    this.updating = true;

    this.http.put<UpdateLevelResponse>(
      `/api/admin/users/${this.selectedUser.id}/level`,
      { user_level: this.newUserLevel }
    ).subscribe({
      next: (response) => {
        this.updating = false;
        if (response.success) {
          this.toastService.success(response.message || 'User level updated successfully');
          this.closeEditModal();
          this.loadUsers(); // Reload the list
        } else {
          this.toastService.error(response.message || 'Failed to update user level');
        }
      },
      error: (error) => {
        this.updating = false;
        console.error('Error updating user level:', error);
        const errorMessage = error.error?.message || 'Failed to update user level';
        this.toastService.error(errorMessage);
      }
    });
  }
}
