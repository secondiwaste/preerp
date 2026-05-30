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

interface BetonozasiNaploEntry {
  id: number;
  datum: string;
  rendszam?: string;
  szallitolevel_szama?: string;
  betonuzem?: string;
  betonminoseg?: string;
  kiteti_osztalyok?: string;
  maximalis_szemnagysag?: string;
  cementfajta?: string;
  receptszam?: string;
  levego_beton_homerseklete?: number;
  keveres_kezdete?: string;
  keveres_vege?: string;
  erkezes_ideje?: string;
  terules?: number;
  urites_kezdete?: string;
  urites_vege?: string;
  idon_tuli_varakozas?: number;
  elmeleti_mennyiseg?: number;
  kert_mennyiseg?: number;
  adalekszerek?: string;
  formalevalaszto?: string;
  megjegyzes?: string;
  created_by: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

interface BetonozasiNaploResponse {
  success: boolean;
  data: {
    entries: BetonozasiNaploEntry[];
    entry?: BetonozasiNaploEntry;
  };
}

interface SaveResponse {
  success: boolean;
  message: string;
  data?: {
    entry: BetonozasiNaploEntry;
  };
}

@Component({
  selector: 'app-betonozasi-naplo',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
  templateUrl: './betonozasi-naplo.component.html',
  styleUrls: ['./betonozasi-naplo.component.css']
})
export class BetonozasiNaploComponent implements OnInit, AfterViewInit {
  entries: BetonozasiNaploEntry[] = [];
  loading = true;
  showModal = false;
  selectedEntry: BetonozasiNaploEntry | null = null;
  saving = false;
  
  // Year-month filter
  selectedYearMonth: string;
  
  // Search and sort
  searchQuery: string = '';
  sortField: string = 'datum';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Form data
  formData: Partial<BetonozasiNaploEntry> = {
    datum: '',
    rendszam: '',
    szallitolevel_szama: '',
    betonuzem: '',
    betonminoseg: '',
    kiteti_osztalyok: '',
    maximalis_szemnagysag: '',
    cementfajta: '',
    receptszam: '',
    levego_beton_homerseklete: undefined,
    keveres_kezdete: '',
    keveres_vege: '',
    erkezes_ideje: '',
    terules: undefined,
    urites_kezdete: '',
    urites_vege: '',
    idon_tuli_varakozas: undefined,
    elmeleti_mennyiseg: undefined,
    kert_mennyiseg: undefined,
    adalekszerek: '',
    formalevalaszto: '',
    megjegyzes: ''
  };
  
  // User permissions
  canEdit = false;

  // Autocomplete data
  uniqueRendszamok: string[] = [];

  // Totals for summary row
  totalElmeletiMennyiseg: number = 0;
  totalKertMennyiseg: number = 0;

  // Scroll position preservation
  private savedScrollLeft: number = 0;

  // Cell editing tracking
  editingCell: { entryId: number, column: string, originalValue: any } | null = null;
  editableColumns = [
    'datum', 'rendszam', 'szallitolevel_szama', 'betonuzem', 'betonminoseg',
    'kiteti_osztalyok', 'maximalis_szemnagysag', 'cementfajta', 'receptszam',
    'levego_beton_homerseklete', 'keveres_kezdete', 'keveres_vege', 'erkezes_ideje',
    'terules', 'urites_kezdete', 'urites_vege', 'idon_tuli_varakozas',
    'elmeleti_mennyiseg', 'kert_mennyiseg', 'adalekszerek', 'formalevalaszto', 'megjegyzes'
  ];

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
    
    // Load autocomplete data
    this.loadUniqueRendszamok();
    
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
    
    this.http.get<BetonozasiNaploResponse>('/api/betonozasi-naplo', { params }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.entries = response.data.entries;
          this.calculateTotals();
          
          // Restore scroll position after Angular renders the table
          if (this.savedScrollLeft > 0) {
            setTimeout(() => {
              const tableWrapper = this.elementRef.nativeElement.querySelector('.table-wrapper');
              if (tableWrapper) {
                tableWrapper.scrollLeft = this.savedScrollLeft;
              }
            }, 50);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load entries');
      }
    });
  }

  loadUniqueRendszamok(): void {
    this.http.get<{ success: boolean; data: { rendszamok: string[] } }>('/api/betonozasi-naplo/rendszamok').subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.uniqueRendszamok = response.data.rendszamok;
        }
      },
      error: (error) => {
        console.error('Failed to load unique rendszamok:', error);
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

  private saveScrollPosition(): void {
    const tableWrapper = this.elementRef.nativeElement.querySelector('.table-wrapper');
    if (tableWrapper) {
      this.savedScrollLeft = tableWrapper.scrollLeft;
    }
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '⇅';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  createNewEntry(): void {
    if (!this.canEdit) return;
    
    const newEntry = {
      datum: new Date().toISOString().split('T')[0],
      rendszam: '',
      szallitolevel_szama: '',
      betonuzem: '',
      betonminoseg: '',
      kiteti_osztalyok: '',
      maximalis_szemnagysag: '',
      cementfajta: '',
      receptszam: '',
      levego_beton_homerseklete: undefined,
      keveres_kezdete: '',
      keveres_vege: '',
      erkezes_ideje: '',
      terules: undefined,
      urites_kezdete: '',
      urites_vege: '',
      idon_tuli_varakozas: undefined,
      elmeleti_mennyiseg: undefined,
      kert_mennyiseg: undefined,
      adalekszerek: '',
      formalevalaszto: '',
      megjegyzes: ''
    };
    
    this.http.post<SaveResponse>('/api/betonozasi-naplo', newEntry).subscribe({
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

  openEditModal(entry: BetonozasiNaploEntry): void {
    this.selectedEntry = entry;
    this.formData = {
      datum: this.getDateForInput(entry.datum),
      rendszam: entry.rendszam || '',
      szallitolevel_szama: entry.szallitolevel_szama || '',
      betonuzem: entry.betonuzem || '',
      betonminoseg: entry.betonminoseg || '',
      kiteti_osztalyok: entry.kiteti_osztalyok || '',
      maximalis_szemnagysag: entry.maximalis_szemnagysag || '',
      cementfajta: entry.cementfajta || '',
      receptszam: entry.receptszam || '',
      levego_beton_homerseklete: entry.levego_beton_homerseklete,
      keveres_kezdete: entry.keveres_kezdete || '',
      keveres_vege: entry.keveres_vege || '',
      erkezes_ideje: entry.erkezes_ideje || '',
      terules: entry.terules,
      urites_kezdete: entry.urites_kezdete || '',
      urites_vege: entry.urites_vege || '',
      idon_tuli_varakozas: entry.idon_tuli_varakozas,
      elmeleti_mennyiseg: entry.elmeleti_mennyiseg,
      kert_mennyiseg: entry.kert_mennyiseg,
      adalekszerek: entry.adalekszerek || '',
      formalevalaszto: entry.formalevalaszto || '',
      megjegyzes: entry.megjegyzes || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedEntry = null;
  }

  saveEntry(): void {
    if (!this.formData.datum) {
      this.toastService.error(this.translationService.translate('betonozasiNaplo.datumRequired'));
      return;
    }
    
    if (!this.selectedEntry) {
      return;
    }
    
    this.saving = true;
    this.http.put<SaveResponse>(`/api/betonozasi-naplo/${this.selectedEntry.id}`, this.formData).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.toastService.success(response.message);
          this.loadEntries();
          this.closeModal();
        }
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(error.error?.message || 'Failed to save entry');
      }
    });
  }

  deleteEntry(entry: BetonozasiNaploEntry): void {
    if (!confirm(this.translationService.translate('betonozasiNaplo.confirmDelete'))) {
      return;
    }
    
    this.http.delete<SaveResponse>(`/api/betonozasi-naplo/${entry.id}`).subscribe({
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU');
  }

  formatTime(timeString: string | undefined): string {
    if (!timeString) return '';
    return timeString.substring(0, 5);
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
    
    // Find the entry and capture its original value
    const entry = this.entries.find(e => e.id === entryId);
    const originalValue = entry ? (entry as any)[column] : null;
    
    this.editingCell = { entryId, column, originalValue };
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = document.querySelector(`input[data-entry-id="${entryId}"][data-col="${column}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  stopEditCell(entry: BetonozasiNaploEntry, column: string): void {
    // Only save if the value actually changed
    const currentValue = (entry as any)[column];
    const originalValue = this.editingCell?.originalValue;
    
    if (currentValue !== originalValue) {
      this.autoSaveEntry(entry, column);
    }
    
    // Delay clearing to allow click event to fire first
    setTimeout(() => {
      if (this.editingCell?.entryId === entry.id && this.editingCell?.column === column) {
        this.editingCell = null;
      }
    }, 100);
  }

  onCellKeydown(event: KeyboardEvent, entry: BetonozasiNaploEntry, column: string): void {
    const key = event.key;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      
      // Save current cell before moving if value changed
      const currentValue = (entry as any)[column];
      const originalValue = this.editingCell?.originalValue;
      
      if (currentValue !== originalValue) {
        this.autoSaveEntry(entry, column);
      }
      
      const currentIndex = this.entries.findIndex(e => e.id === entry.id);
      let newEntryIndex = currentIndex;
      let newColumnIndex = this.editableColumns.indexOf(column);
      
      switch (key) {
        case 'ArrowUp':
          newEntryIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          newEntryIndex = Math.min(this.entries.length - 1, currentIndex + 1);
          break;
        case 'ArrowLeft':
          newColumnIndex = Math.max(0, newColumnIndex - 1);
          break;
        case 'ArrowRight':
          newColumnIndex = Math.min(this.editableColumns.length - 1, newColumnIndex + 1);
          break;
      }
      
      const newEntry = this.entries[newEntryIndex];
      const newColumn = this.editableColumns[newColumnIndex];
      
      this.editingCell = null;
      setTimeout(() => {
        this.startEditCell(newEntry.id, newColumn);
      }, 50);
    } else if (key === 'Enter') {
      event.preventDefault();
      
      // Save and move down to next row, same column
      const currentValue = (entry as any)[column];
      const originalValue = this.editingCell?.originalValue;
      
      if (currentValue !== originalValue) {
        this.autoSaveEntry(entry, column);
      }
      
      const currentIndex = this.entries.findIndex(e => e.id === entry.id);
      const newEntryIndex = Math.min(this.entries.length - 1, currentIndex + 1);
      const newEntry = this.entries[newEntryIndex];
      
      this.editingCell = null;
      setTimeout(() => {
        this.startEditCell(newEntry.id, column);
      }, 50);
    } else if (key === 'Escape') {
      // Cancel editing and restore original value
      (entry as any)[column] = this.editingCell?.originalValue;
      this.editingCell = null;
    }
  }

  autoSaveEntry(entry: BetonozasiNaploEntry, fieldName: string): void {
    if (!this.canEdit) return;
    
    // Auto-save on blur - send only the changed field
    const updateData: any = {};
    updateData[fieldName] = (entry as any)[fieldName];
    
    this.http.put<SaveResponse>(`/api/betonozasi-naplo/${entry.id}`, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Silent save, no toast notification
          // Don't reload entries - value already updated via two-way binding
          
          // Reload autocomplete data if rendszam was updated
          if (fieldName === 'rendszam') {
            this.loadUniqueRendszamok();
          }
          
          // Recalculate totals if quantity fields were updated
          if (fieldName === 'elmeleti_mennyiseg' || fieldName === 'kert_mennyiseg') {
            this.calculateTotals();
          }
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to update entry');
        this.saveScrollPosition();
        this.loadEntries(); // Reload to restore original values on error
      }
    });
  }

  calculateTotals(): void {
    this.totalElmeletiMennyiseg = this.entries.reduce((sum, entry) => {
      const value = parseFloat(entry.elmeleti_mennyiseg as any) || 0;
      return sum + value;
    }, 0);
    
    this.totalKertMennyiseg = this.entries.reduce((sum, entry) => {
      const value = parseFloat(entry.kert_mennyiseg as any) || 0;
      return sum + value;
    }, 0);
  }
}
