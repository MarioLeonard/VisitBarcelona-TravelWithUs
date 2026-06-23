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
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
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
