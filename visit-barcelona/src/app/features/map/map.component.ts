import { Component, computed, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { GoogleMapsModule, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { AttractionsService } from '@app/core/services/attractions.service';
import { Attraction } from '@app/shared/models';
import { BackButtonComponent } from '@app/shared/components/back-button/back-button.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NzCardModule, 
    NzTagModule, 
    NzSelectModule,
    NzButtonModule,
    GoogleMapsModule,
    BackButtonComponent
  ],
  template: `
    <div class="map-page-container">
      <app-back-button></app-back-button>
      <div class="map-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <h1>Barcelona Map</h1>
        </div>
        <div class="filter-bar">
          <nz-select [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)" nzPlaceHolder="Filter by Category" style="width: 200px;">
            <nz-option nzValue="All" nzLabel="All Categories"></nz-option>
            @for (cat of categories(); track cat) {
              <nz-option [nzValue]="cat" [nzLabel]="cat"></nz-option>
            }
          </nz-select>
        </div>
      </div>

      <div class="map-wrapper">
        <google-map height="600px" width="100%" [center]="center" [zoom]="zoom" [options]="mapOptions">
          @for (attraction of filteredAttractions(); track attraction.id) {
            <map-marker
              #marker="mapMarker"
              [position]="{lat: attraction.lat, lng: attraction.lng}"
              [options]="getMarkerOptions(attraction)"
              (mapClick)="openInfoWindow(marker, attraction)">
            </map-marker>
          }
          <map-info-window #infoWindow>
            @if (selectedAttraction()) {
              <div class="info-window-content">
                @if (selectedAttraction()!.imageUrl) {
                  <img [src]="selectedAttraction()!.imageUrl" [alt]="selectedAttraction()!.name" class="info-window-image" />
                }
                <h3>{{ selectedAttraction()!.name }}</h3>
                <p><strong>{{ selectedAttraction()!.category }}</strong> · {{ selectedAttraction()!.district }}</p>
                <p class="rating">{{ getStars(selectedAttraction()!.rating) }} ({{ selectedAttraction()!.rating }})</p>
                <p>Status: <nz-tag [nzColor]="selectedAttraction()!.visited ? 'success' : 'error'">{{ selectedAttraction()!.visited ? 'Visited' : 'Not Visited' }}</nz-tag></p>
                @if (!selectedAttraction()!.visited) {
                  <button nz-button nzType="primary" nzSize="small" (click)="markVisited(selectedAttraction()!.id)">
                    Mark as Visited
                  </button>
                }
              </div>
            }
          </map-info-window>
        </google-map>

        <nz-card class="legend-card" nzSize="small">
          <h4>Legend</h4>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #52c41a;"></span> Visited
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #ff4d4f;"></span> Not Visited
          </div>
        </nz-card>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: var(--bcn-blue);
      background-image: var(--bg-image);
      background-position: var(--bg-position);
      background-repeat: var(--bg-repeat);
      background-size: var(--bg-size);
      min-height: 100vh;
    }

    .map-page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .map-header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 2rem;
    }
    .filter-bar {
      display: flex;
      align-items: center;
    }
    .map-wrapper {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      position: relative;
    }
    .legend-card {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 10;
      width: 150px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .legend-card h4 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
    }
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      color: #666;
    }
    .legend-color {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-right: 8px;
      display: inline-block;
    }
    .info-window-content {
      padding: 5px;
      min-width: 200px;
    }
    .info-window-image {
      width: 100%;
      height: 180px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .info-window-content h3 {
      margin-top: 0;
      margin-bottom: 5px;
      color: #003DA5;
      font-size: 1.1rem;
    }
    .info-window-content p {
      margin: 5px 0;
      font-size: 0.9rem;
      color: #555;
    }
    .info-window-content .rating {
      color: #fa8c16;
      font-weight: 500;
    }
    .info-window-content button {
      margin-top: 10px;
      width: 100%;
    }
  `]
})
export class MapComponent implements OnInit {
  attractionsService = inject(AttractionsService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  goBack() {
    this.router.navigate(['/attractions']);
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        const attr = this.attractionsService.getById(id);
        if (attr) {
          this.center = { lat: attr.lat, lng: attr.lng };
          this.zoom = 17;
          this.selectedAttraction.set(attr);
        }
      }
    });
  }

  center = { lat: 41.3851, lng: 2.1734 };
  zoom = 13;
  mapOptions = {
    disableDefaultUI: false
  };

  selectedCategory = signal<string>('All');
  selectedAttraction = signal<Attraction | null>(null);

  categories = computed(() => {
    const allCategories = this.attractionsService.attractions().map(a => a.category);
    return Array.from(new Set(allCategories)).sort();
  });

  filteredAttractions = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'All') return this.attractionsService.attractions();
    return this.attractionsService.attractions().filter(a => a.category === cat);
  });

  getMarkerOptions(attraction: Attraction): any {
    return {
      title: attraction.name,
      icon: attraction.visited 
        ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    };
  }

  openInfoWindow(marker: MapMarker, attraction: Attraction) {
    this.selectedAttraction.set(attraction);
    this.infoWindow.open(marker);
  }

  markVisited(id: string) {
    this.attractionsService.markVisited(id);
    const updated = this.attractionsService.getById(id);
    if (updated) {
      this.selectedAttraction.set(updated);
    }
  }

  getStars(rating: number): string {
    return '⭐'.repeat(Math.round(rating));
  }
}
