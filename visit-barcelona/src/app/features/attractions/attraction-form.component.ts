import { Component, input, output, OnInit, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { Attraction } from '@app/shared/models';

@Component({
  selector: 'app-attraction-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzRateModule,
    NzSwitchModule,
    NzButtonModule,
    NzGridModule
  ],
  template: `
    <form [formGroup]="form" class="attraction-form">
      <!-- Name Field -->
      <div nz-row nzGutter="16">
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label nzRequired>Name</nz-form-label>
            <nz-form-control [nzErrorTip]="nameErrorTpl">
              <input nz-input formControlName="name" placeholder="e.g., Sagrada Família" />
              <ng-template #nameErrorTpl let-control>
                @if (control.errors?.['required']) {
                  Name is required
                }
                @if (control.errors?.['minlength']) {
                  Name must be at least 3 characters
                }
              </ng-template>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Category Field -->
      <div nz-row nzGutter="16">
        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label nzRequired>Category</nz-form-label>
            <nz-form-control [nzErrorTip]="'Category is required'">
              <nz-select
                formControlName="category"
                nzPlaceHolder="Select category"
              >
                @for (option of categoryOptions; track option) {
                  <nz-option [nzValue]="option" [nzLabel]="option"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- District Field -->
        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label nzRequired>District</nz-form-label>
            <nz-form-control [nzErrorTip]="'District is required'">
              <nz-select
                formControlName="district"
                nzPlaceHolder="Select district"
              >
                @for (option of districtOptions; track option) {
                  <nz-option [nzValue]="option" [nzLabel]="option"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Description Field -->
      <div nz-row nzGutter="16">
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label>Description</nz-form-label>
            <nz-form-control>
              <textarea
                nz-input
                formControlName="description"
                placeholder="Enter attraction description"
                [nzAutosize]="{ minRows: 3, maxRows: 6 }"
              ></textarea>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Rating Field -->
      <div nz-row nzGutter="16">
        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label nzRequired>Rating</nz-form-label>
            <nz-form-control [nzErrorTip]="'Rating is required'">
              <div class="rating-control">
                <nz-rate
                  formControlName="rating"
                  [nzCount]="5"
                  [nzTooltips]="['Terrible', 'Bad', 'Normal', 'Good', 'Excellent']"
                ></nz-rate>
                <span class="rating-value">{{ form.get('rating')?.value }} / 5</span>
              </div>
            </nz-form-control>
          </nz-form-item>
        </div>

        <!-- Visited Toggle -->
        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label>Visited</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="visited"></nz-switch>
              <span class="visited-label">{{ form.get('visited')?.value ? 'Visited' : 'Not visited' }}</span>
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Latitude / Longitude -->
      <div nz-row nzGutter="16">
        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label nzRequired>Latitude</nz-form-label>
            <nz-form-control [nzErrorTip]="'Latitude is required (range: -90 to 90)'">
              <input
                nz-input
                type="number"
                formControlName="lat"
                placeholder="e.g., 41.4036"
                step="0.0001"
                min="-90"
                max="90"
              />
            </nz-form-control>
          </nz-form-item>
        </div>

        <div nz-col nzXs="24" nzSm="12">
          <nz-form-item>
            <nz-form-label nzRequired>Longitude</nz-form-label>
            <nz-form-control [nzErrorTip]="'Longitude is required (range: -180 to 180)'">
              <input
                nz-input
                type="number"
                formControlName="lng"
                placeholder="e.g., 2.1744"
                step="0.0001"
                min="-180"
                max="180"
              />
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Image Upload -->
      <div nz-row nzGutter="16">
        <div nz-col nzSpan="24">
          <nz-form-item>
            <nz-form-label>Photo (Optional)</nz-form-label>
            <nz-form-control>
              <input
                type="file"
                accept="image/*"
                (change)="onFileSelected($event)"
                class="file-upload-input"
              />
              @if (form.get('imageUrl')?.value) {
                <div class="image-preview">
                  <img [src]="form.get('imageUrl')?.value" alt="Preview" />
                  <button nz-button nzType="text" nzDanger nzSize="small" (click)="removeImage($event)">Remove</button>
                </div>
              }
            </nz-form-control>
          </nz-form-item>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button nz-button nzType="primary" (click)="onSubmit()" [disabled]="form.invalid">
          {{ submitLabel() }}
        </button>
        <button nz-button (click)="onCancel()">
          Cancel
        </button>
      </div>
    </form>
  `,
  styles: [`
    .attraction-form {
      padding: 1rem;
    }

    .rating-control {
      display: flex;
      align-items: center;
    }

    .rating-value {
      margin-left: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .visited-label {
      margin-left: 0.75rem;
      color: #666;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    input[type="number"] {
      width: 100%;
    }

    .file-upload-input {
      display: block;
      margin-bottom: 8px;
    }

    .image-preview {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-top: 8px;
      padding: 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      max-width: 200px;
    }

    .image-preview img {
      max-width: 100%;
      max-height: 150px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 8px;
    }
  `]
})
export class AttractionFormComponent implements OnInit {
  initialData = input<Partial<Attraction>>({});
  submitLabel = input<string>('Add Attraction');

  formSubmit = output<Omit<Attraction, 'id' | 'addedDate'>>();
  cancel = output<void>();

  form!: FormGroup;

  categoryOptions = [
    'Church',
    'Park',
    'Museum',
    'Beach',
    'Market',
    'Stadium',
    'Historic Site',
    'Monument',
    'Art Gallery'
  ];

  districtOptions = [
    'Eixample',
    'Gràcia',
    'Barceloneta',
    'Gothic Quarter',
    'Les Corts',
    'Montjuïc',
    'Sagrada Família',
    'Sant Martí',
    'Horta-Guinardó',
    'Nou Barris'
  ];

  constructor(private fb: FormBuilder) {
    effect(() => {
      // Allow syncing form when initialData changes externally if required
      const data = this.initialData();
      if (this.form && data) {
        this.form.patchValue(data, { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    const data = this.initialData();
    this.form = this.fb.group({
      name: [
        data.name || '',
        [Validators.required, Validators.minLength(3)]
      ],
      category: [
        data.category || '',
        [Validators.required]
      ],
      district: [
        data.district || '',
        [Validators.required]
      ],
      rating: [
        data.rating || 3,
        [Validators.required]
      ],
      visited: [
        data.visited || false
      ],
      description: [
        data.description || '',
        []
      ],
      lat: [
        data.lat || null,
        [Validators.required]
      ],
      lng: [
        data.lng || null,
        [Validators.required]
      ],
      imageUrl: [
        data.imageUrl || ''
      ]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.form.patchValue({
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.preventDefault();
    this.form.patchValue({
      imageUrl: ''
    });
    // Clear the input value so the same file can be selected again
    const fileInput = document.querySelector('.file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.formSubmit.emit({
        name: formValue.name,
        category: formValue.category,
        district: formValue.district,
        rating: formValue.rating,
        visited: formValue.visited,
        description: formValue.description,
        lat: Number(formValue.lat),
        lng: Number(formValue.lng),
        imageUrl: formValue.imageUrl || undefined
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
