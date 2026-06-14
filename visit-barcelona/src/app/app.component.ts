import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService } from '@app/core/services/auth.service';

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
    NzSpinModule
  ],
  template: `
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
  `,
  styles: [`
    .app-layout {
      min-height: 100vh;
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
