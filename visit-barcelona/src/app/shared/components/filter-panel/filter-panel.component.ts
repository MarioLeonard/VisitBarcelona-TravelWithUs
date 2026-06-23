import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';

export interface FilterState {
  districts: string[];
  categories: string[];
  ratingRange: [number, number];
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzSelectModule,
    NzSliderModule,
    NzButtonModule,
    NzCollapseModule,
    NzSpaceModule,
    NzBadgeModule,
    NzIconModule,
    NzTagModule
  ],
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.scss'
})
export class FilterPanelComponent {
  @Input() availableDistricts: string[] = [
    'Eixample',
    'Gràcia',
    'Barceloneta',
    'Gothic Quarter',
    'Les Corts'
  ];

  @Input() availableCategories: string[] = [
    'Church',
    'Park',
    'Museum',
    'Beach',
    'Market',
    'Stadium'
  ];

  @Output() filterChange = new EventEmitter<FilterState>();

  isExpanded = false;
  selectedDistricts: string[] = [];
  selectedCategories: string[] = [];
  ratingRange: [number, number] = [0, 5];

  marks = {
    0: '0',
    2.5: '2.5',
    5: '5'
  };

  tipFormatter = (value: number): string => {
    return value.toFixed(1);
  };

  activeFilterCount(): number {
    return this.selectedDistricts.length + 
           this.selectedCategories.length + 
           (this.ratingRange[0] > 0 || this.ratingRange[1] < 5 ? 1 : 0);
  }

  onFilterChange(): void {
    this.filterChange.emit({
      districts: this.selectedDistricts,
      categories: this.selectedCategories,
      ratingRange: this.ratingRange
    });
  }

  removeDistrict(district: string): void {
    this.selectedDistricts = this.selectedDistricts.filter(d => d !== district);
    this.onFilterChange();
  }

  removeCategory(category: string): void {
    this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    this.onFilterChange();
  }

  clearAllFilters(): void {
    this.selectedDistricts = [];
    this.selectedCategories = [];
    this.ratingRange = [0, 5];
    this.onFilterChange();
  }
}
