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
  templateUrl: './attraction-form.component.html',
  styleUrl: './attraction-form.component.scss'
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
