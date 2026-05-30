import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

interface Project {
  id: number;
  munkaszam: string;
  munka_megnevezes: string;
  reszletek?: string;
  megrendelo_neve?: string;
  megrendelo_adatai?: string;
  szallitasi_cim?: string;
  created_by: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
  closed: boolean;
}

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

interface ProjectResponse {
  success: boolean;
  message: string;
  data?: {
    project: Project;
  };
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  showModal = false;
  isEditMode = false;
  selectedProject: Project | null = null;
  saving = false;
  
  // Search and sort
  searchQuery: string = '';
  sortField: string = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Filter by closed status
  closedFilter: 'false' | 'true' | 'all' = 'false'; // Default: show only active projects
  
  // Form data
  formData = {
    munkaszam: '',
    munka_megnevezes: '',
    reszletek: '',
    megrendelo_neve: '',
    megrendelo_adatai: '',
    szallitasi_cim: ''
  };
  
  // User permissions
  canEdit = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = currentUser?.user_level === 'moderator' || currentUser?.user_level === 'administrator';
    
    // Read filter from URL query parameter
    this.route.queryParams.subscribe(params => {
      const filter = params['filter'];
      if (filter && (filter === 'false' || filter === 'true' || filter === 'all')) {
        this.closedFilter = filter as 'false' | 'true' | 'all';
      }
      this.loadProjects();
    });
  }

  loadProjects(): void {
    const params: any = {};
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    if (this.sortField) {
      params.sortField = this.sortField;
      params.sortDirection = this.sortDirection;
    }
    
    // Add closed filter
    params.closed = this.closedFilter;
    
    this.http.get<ProjectsResponse>('/api/project', { params }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.projects = response.data.projects;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading projects:', error);
        this.toastService.error('Failed to load projects');
      }
    });
  }
  
  onSearchChange(): void {
    this.loadProjects();
  }
  
  onClosedFilterChange(): void {
    // Update URL query parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: this.closedFilter },
      queryParamsHandling: 'merge'
    });
    this.loadProjects();
  }
  
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadProjects();
  }
  
  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedProject = null;
    this.resetForm();
    this.showModal = true;
  }

  openEditModal(project: Project): void {
    this.isEditMode = true;
    this.selectedProject = project;
    this.formData = {
      munkaszam: project.munkaszam,
      munka_megnevezes: project.munka_megnevezes,
      reszletek: project.reszletek || '',
      megrendelo_neve: project.megrendelo_neve || '',
      megrendelo_adatai: project.megrendelo_adatai || '',
      szallitasi_cim: project.szallitasi_cim || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedProject = null;
    this.resetForm();
    this.saving = false;
  }

  resetForm(): void {
    this.formData = {
      munkaszam: '',
      munka_megnevezes: '',
      reszletek: '',
      megrendelo_neve: '',
      megrendelo_adatai: '',
      szallitasi_cim: ''
    };
  }

  saveProject(): void {
    if (this.saving) return;
    
    if (!this.formData.munkaszam || !this.formData.munka_megnevezes) {
      this.toastService.error('Munkaszám and Munka megnevezése are required');
      return;
    }
    
    this.saving = true;
    
    if (this.isEditMode && this.selectedProject) {
      // Update existing project
      this.http.put<ProjectResponse>(
        `/api/project/${this.selectedProject.id}`,
        this.formData
      ).subscribe({
        next: (response) => {
          this.saving = false;
          if (response.success) {
            this.toastService.success(response.message || 'Project updated successfully');
            this.closeModal();
            this.loadProjects();
          } else {
            this.toastService.error(response.message || 'Failed to update project');
          }
        },
        error: (error) => {
          this.saving = false;
          console.error('Error updating project:', error);
          const errorMessage = error.error?.message || 'Failed to update project';
          this.toastService.error(errorMessage);
        }
      });
    } else {
      // Create new project
      this.http.post<ProjectResponse>('/api/project', this.formData).subscribe({
        next: (response) => {
          this.saving = false;
          if (response.success) {
            this.toastService.success(response.message || 'Project created successfully');
            this.closeModal();
            this.loadProjects();
          } else {
            this.toastService.error(response.message || 'Failed to create project');
          }
        },
        error: (error) => {
          this.saving = false;
          console.error('Error creating project:', error);
          const errorMessage = error.error?.message || 'Failed to create project';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  toggleProjectClosed(project: Project): void {
    const newStatus = !project.closed;
    const action = newStatus ? 'close' : 'reopen';
    const confirmKey = `projects.confirm${action.charAt(0).toUpperCase() + action.slice(1)}`;
    const confirmMessage = this.translationService.translate(confirmKey).replace('{munkaszam}', project.munkaszam);
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    this.http.put<ProjectResponse>(`/api/project/${project.id}/closed`, { closed: newStatus }).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message || `Project ${action}d successfully`);
          this.loadProjects();
        } else {
          this.toastService.error(response.message || `Failed to ${action} project`);
        }
      },
      error: (error) => {
        console.error(`Error ${action}ing project:`, error);
        const errorMessage = error.error?.message || `Failed to ${action} project`;
        this.toastService.error(errorMessage);
      }
    });
  }

  deleteProject(project: Project): void {
    const message = this.translationService.translate('projects.confirmDelete').replace('{munkaszam}', project.munkaszam);
    if (!confirm(message)) {
      return;
    }
    
    this.http.delete<ProjectResponse>(`/api/project/${project.id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message || 'Project deleted successfully');
          this.loadProjects();
        } else {
          this.toastService.error(response.message || 'Failed to delete project');
        }
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        const errorMessage = error.error?.message || 'Failed to delete project';
        this.toastService.error(errorMessage);
      }
    });
  }

  viewProjectDetails(projectId: number): void {
    this.router.navigate(['/project', projectId]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
