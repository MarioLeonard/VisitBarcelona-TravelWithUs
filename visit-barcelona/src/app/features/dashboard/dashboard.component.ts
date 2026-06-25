import { Component, computed, inject, signal, ChangeDetectionStrategy, AfterViewInit, HostListener } from '@angular/core';
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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements AfterViewInit {
  private authService = inject(AuthService);
  private attractionsService = inject(AttractionsService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  weatherPanelVisible = signal<boolean>(false);

  toggleWeatherPanel(): void {
    this.weatherPanelVisible.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.weather-floating-panel') && !target.closest('.weather-toggle-btn')) {
      this.weatherPanelVisible.set(false);
    }
  }

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
        path: 0, // 0 corresponds to google.maps.SymbolPath.CIRCLE
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
