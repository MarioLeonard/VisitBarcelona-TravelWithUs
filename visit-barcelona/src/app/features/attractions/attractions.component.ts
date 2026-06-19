import { Component, OnInit, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { AttractionsService } from '@app/core/services/attractions.service';
import { Attraction } from '@app/shared/models';
import { AttractionFormComponent } from './attraction-form.component';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';
import { FilterPanelComponent, FilterState } from '@app/shared/components/filter-panel/filter-panel.component';

@Component({
  selector: 'app-attractions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzRateModule,
    NzTagModule,
    NzBadgeModule,
    NzModalModule,
    NzPopconfirmModule,
    NzIconModule,
    NzSpaceModule,
    NzEmptyModule,
    NzGridModule,
    NzTooltipModule,
    AttractionFormComponent,
    BackButtonComponent,
    FilterPanelComponent
  ],
  template: `
    <div class="attractions-container">
      <app-back-button></app-back-button>
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>Barcelona Attractions</h1>
          <p class="stats">
            Total: {{ attractionsService.attractions().length }} | 
            Visited: {{ attractionsService.visitedCount() }} | 
            Remaining: {{ attractionsService.remainingCount() }}
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button nz-button nzType="default" nzSize="large" (click)="exportToExcel()">
            <span nz-icon nzType="export"></span>
            Export to Excel
          </button>
          <button nz-button nzType="primary" nzSize="large" (click)="openAddModal()">
            <span nz-icon nzType="plus"></span>
            Add Attraction
          </button>
        </div>
      </div>

      <!-- Filter Panel -->
      <app-filter-panel (filterChange)="onFilterChange($event)"></app-filter-panel>

      <!-- Search Bar -->
      <div class="search-bar">
        <input
          nz-input
          nzSize="large"
          nzPlaceHolder="Search by name, category, or district..."
          [(ngModel)]="searchQuery"
          (input)="onSearchChange($event)"
          nzPrefix="search"
        />
      </div>

      <!-- Attractions Table -->
      <nz-table
        #table
        [nzData]="filteredAttractions()"
        nzBordered
        [nzFrontPagination]="false"
        [nzShowPagination]="true"
        [nzPageSize]="10"
        [nzShowSizeChanger]="true"
        [nzShowQuickJumper]="true"
      >
        <thead>
          <tr>
            <th [nzWidth]="'18%'" [nzSortFn]="sortNameFn">Name</th>
            <th [nzWidth]="'12%'" [nzSortFn]="sortCategoryFn">Category</th>
            <th [nzWidth]="'12%'" [nzSortFn]="sortDistrictFn">District</th>
            <th [nzWidth]="'12%'" [nzSortFn]="sortRatingFn">Rating</th>
            <th [nzWidth]="'10%'" [nzSortFn]="sortStatusFn">Status</th>
            <th [nzWidth]="'12%'" [nzSortFn]="sortDateFn">Added Date</th>
            <th [nzWidth]="'14%'">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (attraction of table.data; track attraction.id) {
            <tr>
              <!-- Name -->
              <td>
                <div style="display: flex; align-items: center; gap: 15px;">
                  @if (attraction.imageUrl) {
                    <img [src]="attraction.imageUrl" [alt]="attraction.name" style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                  } @else {
                    <div style="width: 80px; height: 80px; background: #f5f5f5; border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                      <span nz-icon nzType="picture" style="color: #bfbfbf; font-size: 24px;"></span>
                    </div>
                  }
                  <strong style="font-size: 1.05rem;">{{ attraction.name }}</strong>
                </div>
              </td>

              <!-- Category -->
              <td>
                <nz-tag [nzColor]="'blue'">{{ attraction.category }}</nz-tag>
              </td>

              <!-- District -->
              <td>
                {{ attraction.district }}
              </td>

              <!-- Rating -->
              <td>
                <nz-rate
                  [ngModel]="attraction.rating"
                  [nzDisabled]="true"
                  nzAllowHalf
                ></nz-rate>
                <span class="rating-value">{{ attraction.rating }}/5</span>
              </td>

              <!-- Visited Status -->
              <td>
                @if (attraction.visited) {
                  <nz-badge nzStatus="success" nzText="Visited"></nz-badge>
                } @else {
                  <nz-badge nzStatus="default" nzText="Not visited"></nz-badge>
                }
              </td>

              <!-- Added Date -->
              <td>
                <small>{{ attraction.addedDate | date: 'short' }}</small>
              </td>

              <!-- Actions -->
              <td>
                <nz-space nzSize="small">
                  <button nz-button nzType="primary" nzSize="small" nz-tooltip nzTooltipTitle="Edit Attraction" aria-label="Edit Attraction" (click)="openEditModal(attraction)">
                    <span nz-icon nzType="edit"></span>
                  </button>
                  <button
                    nz-button
                    nzType="primary"
                    nzDanger
                    nzSize="small"
                    nz-tooltip 
                    nzTooltipTitle="Delete Attraction"
                    aria-label="Delete Attraction"
                    nz-popconfirm
                    [nzPopconfirmTitle]="'Delete Attraction?'"
                    (nzOnConfirm)="onDeleteConfirm(attraction.id)"
                    nzPopconfirmOkText="Yes"
                    nzPopconfirmCancelText="No"
                  >
                    <span nz-icon nzType="delete"></span>
                  </button>
                </nz-space>
              </td>
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="7" style="text-align: center; padding: 2rem;">
                <nz-empty [nzNotFoundContent]="'No attractions found'"></nz-empty>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <!-- Add Modal -->
      <nz-modal
        [(nzVisible)]="isAddModalVisible"
        nzTitle="Add New Attraction"
        nzWidth="600px"
        [nzFooter]="null"
        (nzOnCancel)="closeAddModal()"
      >
        <ng-container *nzModalContent>
          <app-attraction-form
            [submitLabel]="'Add Attraction'"
            (formSubmit)="onFormSubmit($event)"
            (cancel)="closeAddModal()"
          ></app-attraction-form>
        </ng-container>
      </nz-modal>

      <!-- Edit Modal -->
      <nz-modal
        [(nzVisible)]="isEditModalVisible"
        nzTitle="Edit Attraction"
        nzWidth="600px"
        [nzFooter]="null"
        (nzOnCancel)="closeEditModal()"
      >
        <ng-container *nzModalContent>
          @if (editingAttraction()) {
            <app-attraction-form
              [initialData]="editingAttraction()!"
              [submitLabel]="'Update Attraction'"
              (formSubmit)="onEditFormSubmit($event)"
              (cancel)="closeEditModal()"
            ></app-attraction-form>
          }
        </ng-container>
      </nz-modal>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: var(--bcn-blue);
      background-image: var(--bg-image);
      background-position: var(--bg-position);
      background-repeat: var(--bg-repeat);
      background-size: var(--bg-size);
      min-height: 100vh;
    }

    .attractions-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left h1 {
      margin: 0;
      font-size: 2rem;
      color: #ffffff;
    }

    .stats {
      margin: 0.5rem 0 0 0;
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.85);
    }

    .search-bar {
      margin-bottom: 1.5rem;
    }

    ::ng-deep .ant-table {
      font-size: 0.9rem;
    }

    ::ng-deep .ant-table-thead > tr > th {
      background: #fafafa;
      font-weight: 600;
    }

    .rating-value {
      margin-left: 0.5rem;
      color: #666;
      font-size: 0.85rem;
    }

    ::ng-deep nz-space-item {
      display: flex;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .attractions-container {
        padding: 1rem;
      }

      ::ng-deep .ant-table {
        font-size: 0.8rem;
      }

      ::ng-deep .ant-btn {
        font-size: 0.8rem !important;
      }
    }
  `]
})
export class AttractionsComponent implements OnInit {
  searchQuery = '';
  isAddModalVisible = false;
  isEditModalVisible = false;
  editingAttraction = signal<Attraction | undefined>(undefined);

  // Filter signals
  private selectedDistricts = signal<string[]>([]);
  private selectedCategories = signal<string[]>([]);
  private ratingRange = signal<[number, number]>([0, 5]);

  // Computed filtered attractions combining search + filters
  filteredAttractions = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const districts = this.selectedDistricts();
    const categories = this.selectedCategories();
    const [minRating, maxRating] = this.ratingRange();
    
    let results = this.attractionsService.getAll();

    // Apply text search
    if (query) {
      results = results.filter(a =>
        a.name.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query) ||
        a.district.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
      );
    }

    // Apply district filter
    if (districts.length > 0) {
      results = results.filter(a => districts.includes(a.district));
    }

    // Apply category filter
    if (categories.length > 0) {
      results = results.filter(a => categories.includes(a.category));
    }

    // Apply rating filter
    results = results.filter(a => a.rating >= minRating && a.rating <= maxRating);

    return results;
  });

  sortNameFn = (a: Attraction, b: Attraction) => a.name.localeCompare(b.name);
  sortCategoryFn = (a: Attraction, b: Attraction) => a.category.localeCompare(b.category);
  sortDistrictFn = (a: Attraction, b: Attraction) => a.district.localeCompare(b.district);
  sortRatingFn = (a: Attraction, b: Attraction) => a.rating - b.rating;
  sortStatusFn = (a: Attraction, b: Attraction) => (a.visited ? 1 : 0) - (b.visited ? 1 : 0);
  sortDateFn = (a: Attraction, b: Attraction) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime();

  private searchSubject = new Subject<string>();
  private router = inject(Router);

  constructor(
    public attractionsService: AttractionsService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      // Computed signal will automatically update filtered results
    });
  }

  onSearchChange(event: Event): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(filterState: FilterState): void {
    this.selectedDistricts.set(filterState.districts);
    this.selectedCategories.set(filterState.categories);
    this.ratingRange.set(filterState.ratingRange);
  }

  openAddModal(): void {
    this.isAddModalVisible = true;
  }

  closeAddModal(): void {
    this.isAddModalVisible = false;
  }

  exportToExcel(): void {
    const data = this.filteredAttractions().map(a => ({
      Name: a.name,
      Category: a.category,
      District: a.district,
      Rating: a.rating,
      Visited: a.visited ? 'Yes' : 'No',
      Description: a.description,
      Latitude: a.lat,
      Longitude: a.lng,
      Added_Date: new Date(a.addedDate).toLocaleDateString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attractions');
    XLSX.writeFile(workbook, 'VisitBarcelona_Attractions.xlsx');
  }

  onFormSubmit(data: Omit<Attraction, 'id' | 'addedDate'>): void {
    this.attractionsService.add(data);
    this.message.success('Attraction added successfully!');
    this.closeAddModal();
  }

  openEditModal(attraction: Attraction): void {
    this.editingAttraction.set(attraction);
    this.isEditModalVisible = true;
  }

  closeEditModal(): void {
    this.isEditModalVisible = false;
    this.editingAttraction.set(undefined);
  }

  onEditFormSubmit(data: Omit<Attraction, 'id' | 'addedDate'>): void {
    const attraction = this.editingAttraction();
    if (attraction) {
      this.attractionsService.update(attraction.id, {
        ...data,
        id: attraction.id,
        addedDate: attraction.addedDate
      });
      this.message.success('Attraction updated successfully!');
      this.closeEditModal();
    }
  }

  onDeleteConfirm(id: string): void {
    this.attractionsService.delete(id);
    this.message.success('Attraction deleted successfully!');
  }
}
