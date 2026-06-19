import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '@app/core/services/auth.service';
import { ThemeService } from '@app/core/services/theme.service';
import { ThemeToggleComponent } from '@app/shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NzLayoutModule,
    NzMenuModule,
    NzAvatarModule,
    NzIconModule,
    NzSpinModule,
    ThemeToggleComponent
  ],
  template: `
    <div class="app-wrapper">
      <!-- Global Theme Toggle -->
      @if (authService.isAuthenticated()) {
        <div class="app-theme-bar">
          <app-theme-toggle></app-theme-toggle>
        </div>
      }
      
      @if (authService.isAuthenticated()) {
        <nz-layout class="app-layout">
          <nz-content class="app-content">
            <div class="inner-content">
              <nz-spin [nzSpinning]="isRouting()" nzSize="large" [nzDelay]="100">
                <router-outlet></router-outlet>
              </nz-spin>
            </div>
          </nz-content>
          
          <nz-footer class="app-footer">
            Visit Barcelona - Developed with Angular by TravelWithUs Team
          </nz-footer>
        </nz-layout>
      } @else {
        <nz-spin [nzSpinning]="isRouting()" nzSize="large" [nzDelay]="100">
          <router-outlet></router-outlet>
        </nz-spin>
      }
    </div>
  `,
  styles: [`
    .app-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-theme-bar {
      background-color: var(--bcn-blue);
      padding: 0.5rem 2rem;
      display: flex;
      justify-content: flex-end;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: background-color 0.3s ease;
    }

    :host-context(:root.dark-mode) .app-theme-bar {
      background-color: #0a0a14;
      border-bottom-color: rgba(255, 255, 255, 0.06);
    }

    :host-context(:root.dark-mode) .app-footer {
      background-color: #050508 !important;
      color: rgba(255, 255, 255, 0.4);
    }

    .app-layout {
      flex: 1;
      min-height: calc(100vh - 48px);
    }

    .app-content {
      padding: 24px;
      background-color: var(--bcn-blue);
      background-image: var(--bg-image);
      background-position: var(--bg-position);
      background-repeat: var(--bg-repeat);
      background-size: var(--bg-size);
    }

    .inner-content {
      background: transparent;
      min-height: calc(100vh - 48px - 70px);
    }

    .app-footer {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      background-color: var(--bcn-dark-blue);
    }

    ::ng-deep .ant-spin-nested-loading > div > .ant-spin {
      max-height: 100vh;
    }
  `]
})
export class AppComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);
  
  isRouting = signal(false);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isRouting.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isRouting.set(false);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
