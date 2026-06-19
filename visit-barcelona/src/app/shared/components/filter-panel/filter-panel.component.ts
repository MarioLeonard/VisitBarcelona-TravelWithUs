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
  template: `
    <div class="filter-panel-wrapper">
      <!-- Toggle Button -->
      <button 
        nz-button 
        nzType="default" 
        class="filter-toggle"
        (click)="isExpanded = !isExpanded"
      >
        <span nz-icon nzType="filter" nzTheme="outline"></span>
        Filters
        @if (activeFilterCount() > 0) {
          <nz-badge [nzCount]="activeFilterCount()" nzShowZero="false"></nz-badge>
        }
      </button>

      <!-- Collapsible Filter Panel -->
      @if (isExpanded) {
        <div class="filter-panel-content">
          <div class="filter-section">
            <!-- District Filter -->
            <div class="filter-group">
              <label class="filter-label">District</label>
              <nz-select
                [(ngModel)]="selectedDistricts"
                (ngModelChange)="onFilterChange()"
                nzMode="multiple"
                [nzPlaceHolder]="'Select districts...'"
                nzSize="large"
              >
                @for (district of availableDistricts; track district) {
                  <nz-option [nzValue]="district" [nzLabel]="district"></nz-option>
                }
              </nz-select>
            </div>

            <!-- Category Filter -->
            <div class="filter-group">
              <label class="filter-label">Category</label>
              <nz-select
                [(ngModel)]="selectedCategories"
                (ngModelChange)="onFilterChange()"
                nzMode="multiple"
                [nzPlaceHolder]="'Select categories...'"
                nzSize="large"
              >
                @for (category of availableCategories; track category) {
                  <nz-option [nzValue]="category" [nzLabel]="category"></nz-option>
                }
              </nz-select>
            </div>

            <!-- Rating Filter -->
            <div class="filter-group">
              <label class="filter-label">
                Rating Range: 
                <span class="rating-value">{{ ratingRange[0] }} - {{ ratingRange[1] }} ⭐</span>
              </label>
              <nz-slider
                [(ngModel)]="ratingRange"
                (ngModelChange)="onFilterChange()"
                [nzRange]="true"
                [nzMin]="0"
                [nzMax]="5"
                [nzStep]="0.5"
                [nzMarks]="marks"
                [nzTipFormatter]="tipFormatter"
              ></nz-slider>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Active Filters Display -->
          @if (activeFilterCount() > 0) {
            <div class="active-filters">
              <label class="filter-label">Active Filters:</label>
              <div class="tags-container">
                @for (district of selectedDistricts; track district) {
                  <nz-tag [nzMode]="'closeable'" (nzOnClose)="removeDistrict(district)">
                    {{ district }}
                  </nz-tag>
                }
                @for (category of selectedCategories; track category) {
                  <nz-tag [nzMode]="'closeable'" (nzOnClose)="removeCategory(category)">
                    {{ category }}
                  </nz-tag>
                }
              </div>
            </div>

            <div class="divider"></div>
          }

          <!-- Action Buttons -->
          <div class="filter-actions">
            <button 
              nz-button 
              nzType="default"
              nzDanger
              (click)="clearAllFilters()"
              [disabled]="activeFilterCount() === 0"
            >
              <span nz-icon nzType="delete"></span>
              Clear All
            </button>
            <button 
              nz-button 
              nzType="primary"
              (click)="isExpanded = false"
            >
              <span nz-icon nzType="check"></span>
              Apply
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .filter-panel-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filter-toggle {
      align-self: flex-start;
      width: fit-content;
      font-weight: 500;
    }

    .filter-panel-content {
      background: #ffffff;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .divider {
      height: 1px;
      background-color: #e8e8e8;
      margin: 1rem 0;
    }

    .filter-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .filter-label {
      font-weight: 600;
      color: #262626;
      font-size: 0.95rem;
    }

    .rating-value {
      margin-left: 0.5rem;
      color: var(--bcn-red);
      font-weight: 700;
    }

    .active-filters {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .filter-section {
        grid-template-columns: 1fr;
      }

      .filter-panel-content {
        padding: 1rem;
      }

      .filter-actions {
        flex-direction: column-reverse;
      }

      .filter-actions button {
        width: 100%;
      }
    }
  `]
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
