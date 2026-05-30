import { Component, OnInit } from '@angular/core';
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
}

interface Elemcsoport {
  id: number;
  project_id: number;
  nev: string;
  created_at: string;
  updated_at: string;
}

interface Item {
  id: number;
  elemcsoport_id: number;
  elemjel?: string;
  megjegyzes?: string;
  keszul?: number;
  szelesseg?: number;
  hosszusag?: number;
  magassag?: number;
  created_at: string;
  updated_at: string;
}

interface ProjectResponse {
  success: boolean;
  message?: string;
  data?: {
    project: Project;
  };
}

interface ElemcsoportResponse {
  success: boolean;
  message?: string;
  data?: {
    elemcsoportok: Elemcsoport[];
    elemcsoport?: Elemcsoport;
  };
}

interface ItemResponse {
  success: boolean;
  message?: string;
  data?: {
    items: Item[];
    item?: Item;
  };
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe, FormsModule, MatIconModule],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
  project: Project | null = null;
  elemcsoportok: Elemcsoport[] = [];
  selectedElemcsoport: Elemcsoport | null = null;
  activeElemcsoportIndex: number = 0;
  items: Item[] = [];
  filteredItems: Item[] = [];
  loading = true;
  saving = false;
  
  // User permissions
  canEdit = false;
  
  // Cell editing tracking
  editingCell: { itemId: number, column: string, originalValue: any } | null = null;
  itemColumns = ['elemjel', 'megjegyzes', 'keszul', 'szelesseg', 'hosszusag', 'magassag'];
  
  // Filter and sort
  filters = {
    elemjel: '',
    megjegyzes: '',
    szelesseg: '',
    hosszusag: '',
    magassag: ''
  };
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  // Edit mode for project details
  isEditingProject = false;
  projectFormData = {
    munkaszam: '',
    munka_megnevezes: '',
    reszletek: '',
    megrendelo_neve: '',
    megrendelo_adatai: '',
    szallitasi_cim: ''
  };
  
  // Elemcsoport modal
  showElemcsoportModal = false;
  isEditingElemcsoport = false;
  editingElemcsoport: Elemcsoport | null = null;
  elemcsoportFormData = {
    nev: ''
  };

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.canEdit = currentUser?.user_level === 'moderator' || currentUser?.user_level === 'administrator';
    
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
      this.loadElemcsoportok(projectId);
    } else {
      this.router.navigate(['/project']);
    }
  }

  loadProject(projectId: string): void {
    this.http.get<ProjectResponse>(`/api/project/${projectId}`).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.project = response.data.project;
          this.projectFormData = {
            munkaszam: this.project.munkaszam,
            munka_megnevezes: this.project.munka_megnevezes,
            reszletek: this.project.reszletek || '',
            megrendelo_neve: this.project.megrendelo_neve || '',
            megrendelo_adatai: this.project.megrendelo_adatai || '',
            szallitasi_cim: this.project.szallitasi_cim || ''
          };
        }
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error.error?.message || 'Failed to load project');
        this.router.navigate(['/project']);
      }
    });
  }

  loadElemcsoportok(projectId: string): void {
    this.http.get<ElemcsoportResponse>(`/api/project/${projectId}/elemcsoport`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.elemcsoportok = response.data.elemcsoportok;
          // Check if there's a tab parameter in the URL
          const tabParam = this.route.snapshot.queryParamMap.get('tab');
          const tabIndex = tabParam ? parseInt(tabParam, 10) : 0;
          
          // Select the tab from URL or default to first elemcsoport
          if (this.elemcsoportok.length > 0) {
            // Ensure the tab index is within bounds
            const validIndex = Math.max(0, Math.min(tabIndex, this.elemcsoportok.length - 1));
            this.selectElemcsoport(validIndex);
          }
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to load element groups');
      }
    });
  }

  selectElemcsoport(index: number): void {
    this.activeElemcsoportIndex = index;
    this.selectedElemcsoport = this.elemcsoportok[index];
    
    // Update URL query parameter to persist tab selection
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: index },
      queryParamsHandling: 'merge'
    });
    
    this.loadItems();
  }

  toggleEditProject(): void {
    if (!this.canEdit) return;
    
    if (this.isEditingProject) {
      // Cancel editing - reset form
      if (this.project) {
        this.projectFormData = {
          munkaszam: this.project.munkaszam,
          munka_megnevezes: this.project.munka_megnevezes,
          reszletek: this.project.reszletek || '',
          megrendelo_neve: this.project.megrendelo_neve || '',
          megrendelo_adatai: this.project.megrendelo_adatai || '',
          szallitasi_cim: this.project.szallitasi_cim || ''
        };
      }
    }
    this.isEditingProject = !this.isEditingProject;
  }

  saveProject(): void {
    if (!this.project || !this.canEdit) return;
    
    this.saving = true;
    this.http.put<ProjectResponse>(`/api/project/${this.project.id}`, this.projectFormData).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.toastService.success(response.message || 'Project updated successfully');
          this.loadProject(this.project!.id.toString());
          this.isEditingProject = false;
        }
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(error.error?.message || 'Failed to update project');
      }
    });
  }

  openElemcsoportModal(elemcsoport?: Elemcsoport): void {
    if (!this.canEdit) return;
    
    this.isEditingElemcsoport = !!elemcsoport;
    this.editingElemcsoport = elemcsoport || null;
    
    if (elemcsoport) {
      this.elemcsoportFormData = {
        nev: elemcsoport.nev
      };
    } else {
      this.elemcsoportFormData = {
        nev: ''
      };
    }
    
    this.showElemcsoportModal = true;
  }

  closeElemcsoportModal(): void {
    this.showElemcsoportModal = false;
    this.editingElemcsoport = null;
  }

  saveElemcsoport(): void {
    if (!this.project || !this.canEdit) return;
    
    this.saving = true;
    
    const request = this.isEditingElemcsoport && this.editingElemcsoport
      ? this.http.put<ElemcsoportResponse>(
          `/api/project/${this.project.id}/elemcsoport/${this.editingElemcsoport.id}`,
          this.elemcsoportFormData
        )
      : this.http.post<ElemcsoportResponse>(
          `/api/project/${this.project.id}/elemcsoport`,
          this.elemcsoportFormData
        );
    
    request.subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.toastService.success(response.message || 'Element group saved successfully');
          this.loadElemcsoportok(this.project!.id.toString());
          this.closeElemcsoportModal();
        }
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(error.error?.message || 'Failed to save element group');
      }
    });
  }

  deleteElemcsoport(elemcsoport: Elemcsoport): void {
    if (!this.project || !this.canEdit) return;
    
    const message = this.translationService.translate('projectDetails.confirmDeleteElemcsoport').replace('{nev}', elemcsoport.nev);
    if (!confirm(message)) {
      return;
    }
    
    this.http.delete<ElemcsoportResponse>(
      `/api/project/${this.project.id}/elemcsoport/${elemcsoport.id}`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message || 'Element group deleted successfully');
          this.loadElemcsoportok(this.project!.id.toString());
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to delete element group');
      }
    });
  }

  // Item management methods
  loadItems(): void {
    if (!this.project || !this.selectedElemcsoport) return;
    
    this.http.get<ItemResponse>(
      `/api/project/${this.project.id}/elemcsoport/${this.selectedElemcsoport.id}/items`
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.items = response.data.items;
          this.applyFiltersAndSort();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to load items');
      }
    });
  }

  applyFiltersAndSort(): void {
    let result = [...this.items];
    
    // Apply filters
    if (this.filters.elemjel) {
      result = result.filter(item => 
        item.elemjel?.toLowerCase().includes(this.filters.elemjel.toLowerCase())
      );
    }
    if (this.filters.megjegyzes) {
      result = result.filter(item => 
        item.megjegyzes?.toLowerCase().includes(this.filters.megjegyzes.toLowerCase())
      );
    }
    if (this.filters.szelesseg) {
      result = result.filter(item => 
        item.szelesseg?.toString().includes(this.filters.szelesseg)
      );
    }
    if (this.filters.hosszusag) {
      result = result.filter(item => 
        item.hosszusag?.toString().includes(this.filters.hosszusag)
      );
    }
    if (this.filters.magassag) {
      result = result.filter(item => 
        item.magassag?.toString().includes(this.filters.magassag)
      );
    }
    
    // Apply sorting
    if (this.sortField) {
      result.sort((a, b) => {
        const aVal = (a as any)[this.sortField!];
        const bVal = (b as any)[this.sortField!];
        
        // Handle null/undefined
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        
        // Compare values
        let comparison = 0;
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    this.filteredItems = result;
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) {
      return '↕';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  addItem(): void {
    if (!this.canEdit || !this.project || !this.selectedElemcsoport) return;
    
    this.saving = true;
    // Create item immediately in database with default values
    this.http.post<ItemResponse>(
      `/api/project/${this.project.id}/elemcsoport/${this.selectedElemcsoport.id}/items`,
      {
        elemjel: '',
        megjegyzes: '',
        keszul: null,
        szelesseg: null,
        hosszusag: null,
        magassag: null
      }
    ).subscribe({
      next: (response) => {
        this.saving = false;
        if (response.success) {
          this.toastService.success(response.message || 'Item created successfully');
          this.loadItems();
        }
      },
      error: (error) => {
        this.saving = false;
        this.toastService.error(error.error?.message || 'Failed to create item');
      }
    });
  }

  autoSaveItem(item: Item, fieldName: string): void {
    if (!this.canEdit || !this.project || !this.selectedElemcsoport) return;
    
    // Auto-save on blur - send only the changed field
    const updateData: any = {};
    updateData[fieldName] = (item as any)[fieldName];
    
    this.http.put<ItemResponse>(
      `/api/project/${this.project.id}/elemcsoport/${this.selectedElemcsoport.id}/items/${item.id}`,
      updateData
    ).subscribe({
      next: (response) => {
        if (response.success) {
          // Silent save, no toast notification
          // Don't reload items - value already updated via two-way binding
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to update item');
        this.loadItems(); // Reload to restore original values on error
      }
    });
  }

  // Cell editing methods
  isEditingCell(itemId: number, column: string): boolean {
    return this.editingCell?.itemId === itemId && this.editingCell?.column === column;
  }

  startEditCell(itemId: number, column: string): void {
    if (!this.canEdit) return;
    
    // Find the item and capture its original value
    const item = this.items.find(i => i.id === itemId);
    const originalValue = item ? (item as any)[column] : null;
    
    this.editingCell = { itemId, column, originalValue };
    // Focus the input after Angular renders it
    setTimeout(() => {
      const input = document.querySelector(`input[data-item-id="${itemId}"][data-col="${column}"]`) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  stopEditCell(item: Item, column: string): void {
    // Only save if the value actually changed
    const currentValue = (item as any)[column];
    const originalValue = this.editingCell?.originalValue;
    
    if (currentValue !== originalValue) {
      this.autoSaveItem(item, column);
    }
    
    // Delay clearing to allow click event to fire first
    // This prevents race condition where blur clears editingCell before click can set new one
    setTimeout(() => {
      // Only clear if we're still editing this specific cell
      if (this.editingCell?.itemId === item.id && this.editingCell?.column === column) {
        this.editingCell = null;
      }
    }, 100);
  }

  onCellKeydown(event: KeyboardEvent, item: Item, column: string): void {
    const key = event.key;
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      event.preventDefault();
      
      // Save current cell before moving if value changed
      const currentValue = (item as any)[column];
      const originalValue = this.editingCell?.originalValue;
      
      if (currentValue !== originalValue) {
        this.autoSaveItem(item, column);
      }
      
      const currentIndex = this.items.findIndex(i => i.id === item.id);
      let newItemIndex = currentIndex;
      let newColumnIndex = this.itemColumns.indexOf(column);
      
      switch (key) {
        case 'ArrowUp':
          newItemIndex = Math.max(0, currentIndex - 1);
          break;
        case 'ArrowDown':
          newItemIndex = Math.min(this.items.length - 1, currentIndex + 1);
          break;
        case 'ArrowLeft':
          newColumnIndex = Math.max(0, newColumnIndex - 1);
          break;
        case 'ArrowRight':
          newColumnIndex = Math.min(this.itemColumns.length - 1, newColumnIndex + 1);
          break;
      }
      
      const newItem = this.items[newItemIndex];
      const newColumn = this.itemColumns[newColumnIndex];
      this.startEditCell(newItem.id, newColumn);
    }
  }

  deleteItem(item: Item): void {
    if (!this.canEdit || !this.project || !this.selectedElemcsoport) return;
    
    const message = this.translationService.translate('projectDetails.confirmDeleteItem');
    if (!confirm(message)) {
      return;
    }
    
    this.http.delete<ItemResponse>(
      `/api/project/${this.project.id}/elemcsoport/${this.selectedElemcsoport.id}/items/${item.id}`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.toastService.success(response.message || 'Item deleted successfully');
          this.loadItems();
        }
      },
      error: (error) => {
        this.toastService.error(error.error?.message || 'Failed to delete item');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
