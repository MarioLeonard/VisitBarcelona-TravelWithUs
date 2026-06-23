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
  templateUrl: './attractions.component.html',
  styleUrl: './attractions.component.scss'
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
