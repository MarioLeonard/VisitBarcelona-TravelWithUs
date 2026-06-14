import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-back-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <button nz-button nzType="default" (click)="goBack()" class="back-button">
      <span nz-icon nzType="arrow-left"></span>
      Back to Dashboard
    </button>
  `,
  styles: [`
    .back-button {
      margin-bottom: 1rem;
    }
  `]
})
export class BackButtonComponent {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
