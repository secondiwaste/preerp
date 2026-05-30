import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';

interface Raktar {
  id: number;
  datum: string;
  megnevezes?: string | null;
  szallitasi_koltseg?: number | null;
  created_by: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

interface RaktarElem {
  id: number;
  raktar_id: number;
  megnevezes: string;
  mennyiseg?: number | null;
  mertekegyseg?: string | null;
  netto_egysegar?: number | null;
  created_at: string;
  updated_at: string;
}

interface RaktarResponse {
  success: boolean;
  data: {
    entry: Raktar;
  };
}

interface RaktarElemekResponse {
  success: boolean;
  data: {
    elements: RaktarElem[];
  };
}

interface SaveResponse {
  success: boolean;
  message: string;
  data?: {
    element?: RaktarElem;
    entry?: Raktar;
  };
}

@Component({
  selector: 'app-raktar-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
  templateUrl: './raktar-details.component.html',
  styleUrls: ['./raktar-details.component.css']
})
export class RaktarDetailsComponent implements OnInit {
  raktarId!: number;
  raktar: Raktar | null = null;
  elements: RaktarElem[] = [];
  loading = true;
  saving = false;
  
  // User permissions
  canEdit = false;

  // Edit mode for raktar details
  isEditingRaktar = false;
  raktarFormData = {
    datum: '',
    megnevezes: '',
    szallitasi_koltseg: null as number | null
  };

  // Cell editing tracking
  editingCell: { elemId: number, column: string, originalValue: any } | null = null;
  editableColumns = ['megnevezes', 'mennyiseg', 'mertekegyseg', 'netto_egysegar'];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private translationService: TranslationService,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = currentUser?.user_level === 'moderator' || currentUser?.user_level === 'administrator';
    
    this.route.params.subscribe(params => {
      this.raktarId = +params['id'];
      this.loadRaktar();
      this.loadElements();
    });
  }

  loadRaktar(): void {
    this.http.get<RaktarResponse>(`/api/raktar/${this.raktarId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.raktar = response.data.entry;
          // Initialize form data
          this.raktarFormData = {
            datum: this.getDateForInput(this.raktar.datum),
            megnevezes: this.raktar.megnevezes || '',
            szallitasi_koltseg: this.raktar.szallitasi_koltseg || null
          };
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to load warehouse entry');
        this.router.navigate(['/raktar']);
      }
    });
  }

  loadElements(): void {
    this.loading = true;
    this.http.get<RaktarElemekResponse>(`/api/raktar/${this.raktarId}/elemek`).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.elements = response.data.elements;
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load elements');
      }
    });
  }

  createNewElement(): void {
    if (!this.canEdit) return;
    
    const newElement = {
      megnevezes: ''
    };
    
    this.http.post<SaveResponse>(`/api/raktar/${this.raktarId}/elemek`, newElement).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.loadElements();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to create element');
      }
    });
  }

  deleteElement(element: RaktarElem): void {
    if (!confirm(this.translationService.translate('raktarDetails.confirmDeleteElem'))) {
      return;
    }
    
    this.http.delete<SaveResponse>(`/api/raktar/${this.raktarId}/elemek/${element.id}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message);
          this.loadElements();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to delete element');
      }
    });
  }

  toggleEditRaktar(): void {
    if (!this.canEdit) return;
    
    if (this.isEditingRaktar) {
      // Cancel editing - reset form
      if (this.raktar) {
        this.raktarFormData = {
          datum: this.getDateForInput(this.raktar.datum),
          megnevezes: this.raktar.megnevezes || '',
          szallitasi_koltseg: this.raktar.szallitasi_koltseg || null
        };
      }
    }
    this.isEditingRaktar = !this.isEditingRaktar;
  }

  saveRaktar(): void {
    if (!this.raktar || !this.canEdit) return;
    
    this.saving = true;
    this.http.put<SaveResponse>(`/api/raktar/${this.raktar.id}`, this.raktarFormData).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.toastService.success(response.message || 'Warehouse entry updated successfully');
          this.loadRaktar();
          this.isEditingRaktar = false;
        }
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(error.error?.message || 'Failed to update warehouse entry');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('hu-HU');
  }

  goBack(): void {
    this.router.navigate(['/raktar']);
  }

  // Cell editing methods
  isEditingCell(elemId: number, column: string): boolean {
    return this.editingCell?.elemId === elemId && this.editingCell?.column === column;
  }

  startEditCell(elemId: number, column: string): void {
    if (!this.canEdit) return;
    
    const element = this.elements.find(e => e.id === elemId);
    if (!element) return;
    
    this.editingCell = {
      elemId: elemId,
      column: column,
      originalValue: (element as any)[column]
    };
    
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = this.elementRef.nativeElement.querySelector(
        `input[data-elem-id="${elemId}"][data-col="${column}"]`
      );
      if (input) {
        input.focus();
        if (input.type === 'text') {
          input.select();
        }
      }
    }, 0);
  }

  stopEditCell(element: RaktarElem, column: string): void {
    if (!this.editingCell || this.editingCell.elemId !== element.id || this.editingCell.column !== column) {
      return;
    }
    
    const currentValue = (element as any)[column];
    
    // Check if value changed
    if (currentValue !== this.editingCell.originalValue) {
      this.autoSaveElement(element, column);
    }
    
    this.editingCell = null;
  }

  onCellKeydown(event: KeyboardEvent, element: RaktarElem, column: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.stopEditCell(element, column);
      
      // Move to next cell
      const currentIndex = this.editableColumns.indexOf(column);
      if (currentIndex < this.editableColumns.length - 1) {
        const nextColumn = this.editableColumns[currentIndex + 1];
        setTimeout(() => this.startEditCell(element.id, nextColumn), 50);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      // Restore original value
      (element as any)[column] = this.editingCell!.originalValue;
      this.editingCell = null;
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const currentElemIndex = this.elements.findIndex(e => e.id === element.id);
      const nextIndex = event.key === 'ArrowDown' ? currentElemIndex + 1 : currentElemIndex - 1;
      
      if (nextIndex >= 0 && nextIndex < this.elements.length) {
        this.stopEditCell(element, column);
        const nextElement = this.elements[nextIndex];
        setTimeout(() => this.startEditCell(nextElement.id, column), 50);
      }
    }
  }

  autoSaveElement(element: RaktarElem, fieldName: string): void {
    if (!this.canEdit) return;
    
    // Auto-save on blur - send only the changed field
    const updateData: any = {};
    updateData[fieldName] = (element as any)[fieldName];
    
    this.http.put<SaveResponse>(`/api/raktar/${this.raktarId}/elemek/${element.id}`, updateData).subscribe({
      next: (response) => {
        if (response.success) {
          // Silent save, no toast notification
          // Don't reload elements - value already updated via two-way binding
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to update element');
        this.loadElements(); // Reload to restore original values on error
      }
    });
  }

  calculateTotal(elem: RaktarElem): number {
    const mennyiseg = elem.mennyiseg || 0;
    const netto = elem.netto_egysegar || 0;
    return mennyiseg * netto;
  }

  calculateGrandTotal(): number {
    return this.elements.reduce((sum, elem) => sum + this.calculateTotal(elem), 0);
  }

  calculateGrandTotalWithShipping(): number {
    const grandTotal = this.calculateGrandTotal();
    const shippingCost = this.raktar?.szallitasi_koltseg ? Number(this.raktar.szallitasi_koltseg) : 0;
    return grandTotal + shippingCost;
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
}
