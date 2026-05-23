import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../services/toast.service';

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  category: string;
  message: string;
  user_id: number | null;
  username: string | null;
  ip_address: string | null;
  metadata: any;
}

interface LogsResponse {
  success: boolean;
  data: {
    logs: LogEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface CategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: LogEntry[] = [];
  loading = true;
  
  // Pagination
  currentPage = 1;
  pageSize = 50;
  totalPages = 0;
  totalLogs = 0;
  
  // Filters
  selectedLevel = '';
  selectedCategory = '';
  searchText = '';
  startDate = '';
  endDate = '';
  
  // Available options
  categories: string[] = [];
  levels = ['ERROR', 'WARN', 'INFO', 'SUCCESS', 'DEBUG'];

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadLogs();
  }

  loadCategories(): void {
    this.http.get<CategoriesResponse>('/api/logs/categories').subscribe({
      next: (response) => {
        if (response.success) {
          this.categories = response.data.categories;
        }
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadLogs(): void {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage.toString(),
      limit: this.pageSize.toString()
    };
    
    if (this.selectedLevel) params.level = this.selectedLevel;
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.searchText) params.search = this.searchText;
    if (this.startDate) params.startDate = this.startDate;
    if (this.endDate) params.endDate = this.endDate;
    
    const queryString = new URLSearchParams(params).toString();
    
    this.http.get<LogsResponse>(`/api/logs?${queryString}`).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.logs = response.data.logs;
          this.totalLogs = response.data.pagination.total;
          this.totalPages = response.data.pagination.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading logs:', error);
        this.toastService.error('Failed to load logs');
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadLogs();
  }

  clearFilters(): void {
    this.selectedLevel = '';
    this.selectedCategory = '';
    this.searchText = '';
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;
    this.loadLogs();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLogs();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadLogs();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadLogs();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getLevelClass(level: string): string {
    return `level-${level.toLowerCase()}`;
  }

  expandMetadata(log: LogEntry): void {
    if (log.metadata) {
      alert(JSON.stringify(log.metadata, null, 2));
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
