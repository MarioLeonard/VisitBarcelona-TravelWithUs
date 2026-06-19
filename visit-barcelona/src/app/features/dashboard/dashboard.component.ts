import { Component, computed, inject, signal, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { GoogleMap, MapMarker } from '@angular/google-maps';

import { AuthService } from '@app/core/services/auth.service';
import { AttractionsService } from '@app/core/services/attractions.service';
import { Attraction } from '@app/shared/models';
import { WeatherWidgetComponent } from '@app/shared/components/weather-widget/weather-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    NzCardModule,
    NzButtonModule,
    NzAvatarModule,
    NzGridModule,
    NzStatisticModule,
    NzProgressModule,
    NzBadgeModule,
    NzTagModule,
    NzIconModule,
    GoogleMap,
    MapMarker,
    WeatherWidgetComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <div>
          @if (currentUser()) {
            <h1>Welcome to Barcelona, {{ currentUser()!.name }}!</h1>
            <p class="subtitle">Here is your travel overview</p>
          } @else {
            <h1>Dashboard</h1>
          }
        </div>
        <div class="header-actions">
          <button nz-button nzType="primary" nzSize="large" routerLink="/attractions">
            Manage Attractions
          </button>
          <button nz-button nzDanger (click)="onLogout()">
            Logout
          </button>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <nz-card>
          <nz-statistic [nzValue]="totalAttractions()" nzTitle="Total Attractions"></nz-statistic>
        </nz-card>
        <nz-card>
          <nz-statistic [nzValue]="visitedAttractions()" nzTitle="Visited" [nzValueStyle]="{ color: 'var(--bcn-blue)' }"></nz-statistic>
        </nz-card>
        <nz-card>
          <nz-statistic [nzValue]="remainingAttractions()" nzTitle="Remaining" [nzValueStyle]="{ color: 'var(--bcn-red)' }"></nz-statistic>
        </nz-card>
        <nz-card class="progress-card">
          <h4>Journey Progress</h4>
          <nz-progress [nzPercent]="visitedPercentage()" nzStatus="active" [nzStrokeColor]="'var(--bcn-blue)'"></nz-progress>
        </nz-card>
      </div>

      <!-- Main Content Row -->
      <div class="main-content-row">
        
        <!-- LEFT: Featured Attraction -->
        <div class="featured-section">
          <h2 class="section-title">Featured Attraction</h2>
          @if (featuredAttraction(); as featured) {
            <nz-card class="featured-card" [class.fading]="isFading()">
              <div class="featured-image">
                @if (featured.imageUrl) {
                  <img [src]="featured.imageUrl" [alt]="featured.name" />
                } @else {
                  <span nz-icon nzType="picture" style="color: #bfbfbf; font-size: 48px;"></span>
                }
              </div>
              <div class="featured-info">
                <h3>{{ featured.name }}</h3>
                <p>{{ featured.description || 'No description available.' }}</p>
                <div class="featured-footer">
                  <nz-tag [nzColor]="'#C8102E'">
                    {{ featured.category }}
                  </nz-tag>
                  <span class="rating">
                    ⭐ {{ featured.rating }}
                  </span>
                </div>
              </div>
            </nz-card>
            <!-- Carousel Navigation -->
            <div class="carousel-nav">
              <button nz-button nzShape="circle" (click)="prevAttraction()">
                <span nz-icon nzType="left"></span>
              </button>
              <span class="carousel-counter">
                {{ currentFeaturedIndex() + 1 }} / {{ allAttractions().length }}
              </span>
              <button nz-button nzShape="circle" (click)="nextAttraction()">
                <span nz-icon nzType="right"></span>
              </button>
            </div>
          } @else {
            <nz-card class="featured-card">
              <div class="featured-info">
                <p>No attractions found.</p>
              </div>
            </nz-card>
          }
        </div>

        <!-- RIGHT: Mini Map -->
        <div class="map-section">
          <div class="map-section-header">
            <h2 class="section-title">Barcelona Map</h2>
            <button nz-button nzType="primary" (click)="openFullMap()">
              <span nz-icon nzType="environment"></span>
              Open Full Map
            </button>
          </div>
          <div class="mini-map-wrapper">
            <google-map
              height="100%"
              width="100%"
              [center]="barcelonaCenter"
              [zoom]="13"
              [options]="miniMapOptions">
              <map-marker
                *ngFor="let a of allAttractions()"
                [position]="{ lat: a.lat, lng: a.lng }"
                [title]="a.name"
                [options]="getMarkerOptions(a)">
              </map-marker>
            </google-map>
          </div>
          <div class="map-legend">
            <span>
              <span class="legend-dot visited"></span>
              Visited ({{ visitedAttractions() }})
            </span>
            <span>
              <span class="legend-dot not-visited"></span>
              Not Visited ({{ remainingAttractions() }})
            </span>
          </div>
        </div>

      </div>

      <!-- Weather Widget Section -->
      <div class="weather-section">
        <app-weather-widget></app-weather-widget>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --bcn-red: #C8102E;
      --bcn-blue: #003DA5;
      display: block;
      background-color: var(--bcn-blue);
      background-image: var(--bg-image);
      background-position: var(--bg-position);
      background-repeat: var(--bg-repeat);
      background-size: var(--bg-size);
      min-height: 100vh;
    }

    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 1rem;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 2.2rem;
      color: #ffffff;
      font-weight: bold;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.85);
      margin: 0;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions button {
      height: 40px !important;
      padding: 0 24px !important;
      font-size: 16px !important;
      border-radius: 4px !important;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      line-height: 1;
    }

    .header-actions button[nzType="primary"] {
      background-color: var(--bcn-red);
      border-color: var(--bcn-red);
    }

    .header-actions button[nzType="primary"]:hover {
      background-color: #a00d25;
      border-color: #a00d25;
    }

    .logout-btn {
      background-color: #ffffff !important;
      border-color: #C8102E !important;
      color: #C8102E !important;
    }
    
    .logout-btn:hover {
      background-color: #C8102E !important;
      color: #ffffff !important;
      border-color: #C8102E !important;
    }

    .progress-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .progress-card h4 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      color: #666;
      font-weight: normal;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .progress-card h4 {
      color: #a0a8d0;
    }

    .main-content-row {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
      align-items: start;
      margin-top: 24px;
    }

    .featured-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .section-title {
      color: white;
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 8px 0;
    }

    .featured-card {
      border-radius: 16px;
      overflow: hidden;
      padding: 0;
      transition: opacity 0.3s ease;
      opacity: 1;
    }

    .featured-card.fading {
      opacity: 0;
    }

    ::ng-deep .featured-card > .ant-card-body {
      padding: 0;
    }

    .featured-image {
      height: 220px;
      background: linear-gradient(135deg, #003DA5, #0056d6);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .featured-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .featured-info {
      padding: 16px;
    }

    .featured-info h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: #1a1a2e;
    }

    .featured-info p {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 12px;
    }

    .featured-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .rating {
      font-weight: 700;
      color: #faad14;
      font-size: 1rem;
    }

    .carousel-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .carousel-nav button {
      background-color: white !important;
      border: 1px solid var(--bcn-blue) !important;
      color: var(--bcn-blue) !important;
    }

    .carousel-nav button:hover {
      background-color: var(--bcn-blue) !important;
      color: white !important;
    }

    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      border: 2px solid white;
      transition: background 0.3s;
    }

    .dot.active {
      background: white;
    }

    .map-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .map-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mini-map-wrapper {
      height: 380px;
      border-radius: 16px;
      overflow: hidden;
      border: 2px solid rgba(255,255,255,0.15);
    }

    .map-legend {
      display: flex;
      justify-content: center;
      gap: 32px;
      color: white;
      font-size: 0.9rem;
    }

    .map-legend span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .legend-dot.visited { background: #52c41a; }
    .legend-dot.not-visited { background: #ff4d4f; }

    .weather-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .weather-section app-weather-widget {
      display: block;
      max-width: 400px;
      margin: 0 auto;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 8px;
    }

    @media (max-width: 992px) {
      .main-content-row {
        grid-template-columns: 1fr;
      }
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 576px) {
      .stats-row {
        grid-template-columns: 1fr;
      }
      .map-legend {
        gap: 16px;
      }
    }
  `]
})
export class DashboardComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private attractionsService = inject(AttractionsService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;

  totalAttractions = computed(() => this.attractionsService.attractions().length);
  visitedAttractions = this.attractionsService.visitedCount;
  remainingAttractions = this.attractionsService.remainingCount;

  visitedPercentage = computed(() => {
    const total = this.totalAttractions();
    if (total === 0) return 0;
    return Math.round((this.visitedAttractions() / total) * 100);
  });

  allAttractions = computed(() => this.attractionsService.getAll());
  currentFeaturedIndex = signal<number>(0);
  isFading = signal<boolean>(false);

  featuredAttraction = computed(() => {
    const all = this.allAttractions();
    if (!all.length) return null;
    
    const index = this.currentFeaturedIndex() % all.length;
    return all[index];
  });

  ngAfterViewInit(): void {
    setTimeout(() => {
      const okButton = document.querySelector('.dismissButton');
      if (okButton) (okButton as HTMLElement).click();
    }, 1000);
  }

  nextAttraction(): void {
    const total = this.allAttractions().length;
    if (total === 0) return;
    
    this.isFading.set(true);
    setTimeout(() => {
      this.currentFeaturedIndex.update(i => (i + 1) % total);
      this.isFading.set(false);
    }, 150);
  }

  prevAttraction(): void {
    const total = this.allAttractions().length;
    if (total === 0) return;
    
    this.isFading.set(true);
    setTimeout(() => {
      this.currentFeaturedIndex.update(i => (i - 1 + total) % total);
      this.isFading.set(false);
    }, 150);
  }

  barcelonaCenter = { lat: 41.3851, lng: 2.1734 };
  
  miniMapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    draggable: false,
    gestureHandling: 'none',
    keyboardShortcuts: false,
    styles: [
      {
        featureType: 'all',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#003DA5' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#0a1628' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#1a2f5e' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#0d1f3c' }]
      }
    ]
  };

  getMarkerOptions(attraction: Attraction): google.maps.MarkerOptions {
    return {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: attraction.visited ? '#52c41a' : '#ff4d4f',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    };
  }

  openFullMap(): void {
    this.router.navigate(['/map']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
