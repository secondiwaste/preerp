import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../services/toast.service';
import { TranslationService } from '../../services/translation.service';
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
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
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
  
  // Search and sort
  searchQuery: string = '';
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id;
    this.loadUsers();
  }

  loadUsers(): void {
    const params: any = {};
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    if (this.sortField) {
      params.sortField = this.sortField;
      params.sortDirection = this.sortDirection;
    }
    
    this.http.get<UsersResponse>('/api/admin/users', { params }).subscribe({
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
  
  onSearchChange(): void {
    this.loadUsers();
  }
  
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
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

  toggleUserStatus(user: User): void {
    if (!user || user.id === this.currentUserId) {
      this.toastService.error('You cannot disable your own account');
      return;
    }

    const newStatus = !user.disabled;
    const action = newStatus ? 'disable' : 'enable';
    const confirmKey = newStatus ? 'users.confirmDisable' : 'users.confirmEnable';
    const confirmMessage = this.translationService.translate(confirmKey).replace('{username}', user.username);
    
    if (!confirm(confirmMessage)) {
      return;
    }

    this.http.put<UpdateLevelResponse>(
      `/api/admin/users/${user.id}/status`,
      { disabled: newStatus }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message || `User ${action}d successfully`);
          this.loadUsers(); // Reload the list
        } else {
          this.toastService.error(response.message || `Failed to ${action} user`);
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing user:`, error);
        const errorMessage = error.error?.message || `Failed to ${action} user`;
        this.toastService.error(errorMessage);
      }
    });
  }
}
