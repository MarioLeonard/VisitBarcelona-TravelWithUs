import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ThemeService } from '@app/core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  template: `
    <button 
      nz-button 
      nzType="text" 
      nzSize="large"
      (click)="themeService.toggleTheme()"
      class="theme-toggle-btn"
      [attr.aria-label]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
    >
      @if (themeService.isDarkMode()) {
        <span nz-icon nzType="sun" nzTheme="outline" class="icon"></span>
      } @else {
        <span nz-icon nzType="moon" nzTheme="outline" class="icon"></span>
      }
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      color: #ffffff !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 1rem !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      width: 40px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .theme-toggle-btn:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: #ffffff !important;
    }

    .icon {
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
}
