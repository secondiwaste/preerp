import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
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

// Declare jQuery for TypeScript
declare var $: any;

interface RaktarEntry {
  id: number;
  datum: string;
  megnevezes?: string | null;
  created_by: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

interface RaktarResponse {
  success: boolean;
  data: {
    entries: RaktarEntry[];
    entry?: RaktarEntry;
  };
}

interface SaveResponse {
  success: boolean;
  message: string;
  data?: {
    entry: RaktarEntry;
  };
}

@Component({
  selector: 'app-raktar',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
  templateUrl: './raktar.component.html',
  styleUrls: ['./raktar.component.css']
})
export class RaktarComponent implements OnInit, AfterViewInit {
  entries: RaktarEntry[] = [];
  loading = true;
  
  // Year-month filter
  selectedYearMonth: string;
  
  // Search and sort
  searchQuery: string = '';
  sortField: string = 'datum';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // User permissions
  canEdit = false;

  // Scroll position preservation
  private savedScrollLeft: number = 0;

  // Cell editing tracking
  editingCell: { entryId: number, column: string, originalValue: any } | null = null;
  editableColumns = ['datum'];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService,
    private translationService: TranslationService,
    private elementRef: ElementRef
  ) {
    // Initialize to current year and month in YYYY-MM format
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    this.selectedYearMonth = `${year}-${month}`;
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = currentUser?.user_level === 'moderator' || currentUser?.user_level === 'administrator';
    
    // Read year-month from query parameters
    this.route.queryParams.subscribe(params => {
      if (params['yearMonth']) {
        this.selectedYearMonth = params['yearMonth'];
      }
      this.loadEntries();
    });
  }

  ngAfterViewInit(): void {
    // Initialize MonthPicker with jQuery
    const self = this;
    const inputElement = $(this.elementRef.nativeElement).find('#month-picker-input');
    
    if (inputElement.length && typeof $.fn.MonthPicker !== 'undefined') {
      inputElement.MonthPicker({
        Button: false,
        MonthFormat: 'yy-mm',
        SelectedMonth: this.selectedYearMonth,
        OnAfterChooseMonth: function(this: HTMLElement) {
          const value = $(this).val();
          const [year, month] = value.split('-');
          
          // Update Angular component state
          self.selectedYearMonth = value;
          
          // Navigate with query params
          self.router.navigate([], {
            relativeTo: self.route,
            queryParams: {
              yearMonth: value
            },
            queryParamsHandling: 'merge'
          });
        }
      });
    }
  }

  loadEntries(): void {
    this.loading = true;
    
    // Parse year and month from YYYY-MM format
    const [year, month] = this.selectedYearMonth.split('-').map(num => parseInt(num, 10));
    
    const params: any = {
      sortField: this.sortField,
      sortDirection: this.sortDirection.toUpperCase(),
      year: year,
      month: month
    };
    
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    
    this.http.get<RaktarResponse>('/api/raktar', { params }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.entries = response.data.entries;
          
          // Restore scroll position after Angular renders the table
          if (this.savedScrollLeft > 0) {
            setTimeout(() => {
              const tableWrapper = this.elementRef.nativeElement.querySelector('.table-wrapper');
              if (tableWrapper) {
                tableWrapper.scrollLeft = this.savedScrollLeft;
              }
            }, 0);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load entries');
      }
    });
  }

  onSearchChange(): void {
    this.saveScrollPosition();
    this.loadEntries();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.saveScrollPosition();
    this.loadEntries();
  }

  createNewEntry(): void {
    if (!this.canEdit) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const newEntry = {
      datum: today,
      megnevezes: ''
    };
    
    this.http.post<SaveResponse>('/api/raktar', newEntry).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.loadEntries();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to create entry');
      }
    });
  }

  deleteEntry(entry: RaktarEntry): void {
    if (!confirm(this.translationService.translate('raktar.confirmDelete'))) {
      return;
    }
    
    this.http.delete<SaveResponse>(`/api/raktar/${entry.id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.loadEntries();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to delete entry');
      }
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/raktar', id]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU');
  }

  getMegnevezesOrDefault(megnevezes: string | null | undefined): string {
    return megnevezes && megnevezes.trim() !== '' ? megnevezes : 'raktári bejegyzés';
  }

  getDateForInput(dateString: string): string {
    if (!dateString) return '';
    // Create Date object and extract local date components to avoid timezone issues
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Cell editing methods
  isEditingCell(entryId: number, column: string): boolean {
    return this.editingCell?.entryId === entryId && this.editingCell?.column === column;
  }

  startEditCell(entryId: number, column: string): void {
    if (!this.canEdit) return;
    
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    this.editingCell = {
      entryId: entryId,
      column: column,
      originalValue: (entry as any)[column]
    };
    
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = this.elementRef.nativeElement.querySelector(
        `input[data-entry-id="${entryId}"][data-col="${column}"]`
      );
      if (input) {
        input.focus();
        if (input.type === 'text') {
          input.select();
        }
      }
    }, 0);
  }

  stopEditCell(entry: RaktarEntry, column: string): void {
    if (!this.editingCell || this.editingCell.entryId !== entry.id || this.editingCell.column !== column) {
      return;
    }
    
    const currentValue = (entry as any)[column];
    
    // Check if value changed
    if (currentValue !== this.editingCell.originalValue) {
      this.autoSaveEntry(entry, column);
    }
    
    this.editingCell = null;
  }

  onCellKeydown(event: KeyboardEvent, entry: RaktarEntry, column: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.stopEditCell(entry, column);
      
      // Move to next cell
      const currentIndex = this.editableColumns.indexOf(column);
      if (currentIndex < this.editableColumns.length - 1) {
        const nextColumn = this.editableColumns[currentIndex + 1];
        setTimeout(() => this.startEditCell(entry.id, nextColumn), 50);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      // Restore original value
      (entry as any)[column] = this.editingCell!.originalValue;
      this.editingCell = null;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const currentEntryIndex = this.entries.findIndex(e => e.id === entry.id);
      const nextIndex = event.key === 'ArrowDown' ? currentEntryIndex + 1 : currentEntryIndex - 1;
      
      if (nextIndex >= 0 && nextIndex < this.entries.length) {
        this.stopEditCell(entry, column);
        const nextEntry = this.entries[nextIndex];
        setTimeout(() => this.startEditCell(nextEntry.id, column), 50);
      }
    }
  }

  autoSaveEntry(entry: RaktarEntry, fieldName: string): void {
    if (!this.canEdit) return;
    
    // Auto-save on blur - send only the changed field
    const updateData: any = {};
    updateData[fieldName] = (entry as any)[fieldName];
    
    this.http.put<SaveResponse>(`/api/raktar/${entry.id}`, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Silent save, no toast notification
          // Don't reload entries - value already updated via two-way binding
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to update entry');
        this.saveScrollPosition();
        this.loadEntries(); // Reload to restore original values on error
      }
    });
  }

  private saveScrollPosition(): void {
    const tableWrapper = this.elementRef.nativeElement.querySelector('.table-wrapper');
    if (tableWrapper) {
      this.savedScrollLeft = tableWrapper.scrollLeft;
    }
  }
}
