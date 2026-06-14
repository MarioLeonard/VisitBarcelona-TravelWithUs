import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Attraction } from '@app/shared/models';
import { AuthService } from './auth.service';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable({
  providedIn: 'root'
})
export class AttractionsService {
  private authService = inject(AuthService);

  private getDefaultAttractions(): Attraction[] {
    return [
      {
        id: generateUUID(),
        name: 'Sagrada Família',
        category: 'Church',
        district: 'Eixample',
        rating: 4.8,
        visited: false,
        description: 'Iconic basilica designed by Antoni Gaudí, UNESCO World Heritage Site',
        lat: 41.4036,
        lng: 2.1744,
        imageUrl: '/images/sagrada.jpg',
        addedDate: new Date('2024-01-01')
      },
      {
        id: generateUUID(),
        name: 'Park Güell',
        category: 'Park',
        district: 'Gràcia',
        rating: 4.7,
        visited: false,
        description: 'Modernist park with colorful mosaics and panoramic views of Barcelona',
        lat: 41.3843,
        lng: 2.1528,
        imageUrl: '/images/park-guell.jpg',
        addedDate: new Date('2024-01-02')
      },
      {
        id: generateUUID(),
        name: 'Casa Batlló',
        category: 'Museum',
        district: 'Eixample',
        rating: 4.6,
        visited: false,
        description: 'Gaudí\'s modernist masterpiece with a wavy façade and organic design',
        lat: 41.3915,
        lng: 2.1654,
        imageUrl: '/images/casa-batllo.jpg',
        addedDate: new Date('2024-01-03')
      },
      {
        id: generateUUID(),
        name: 'La Barceloneta Beach',
        category: 'Beach',
        district: 'Barceloneta',
        rating: 4.4,
        visited: false,
        description: 'Popular urban beach with golden sand, close to the city center',
        lat: 41.3851,
        lng: 2.1900,
        imageUrl: '/images/barceloneta.jpg',
        addedDate: new Date('2024-01-04')
      },
      {
        id: generateUUID(),
        name: 'La Boqueria Market',
        category: 'Market',
        district: 'Gothic Quarter',
        rating: 4.5,
        visited: false,
        description: 'Historic food market with fresh produce, seafood, and local delicacies',
        lat: 41.3817,
        lng: 2.1718,
        imageUrl: '/images/boqueria.jpg',
        addedDate: new Date('2024-01-05')
      },
      {
        id: generateUUID(),
        name: 'Camp Nou',
        category: 'Stadium',
        district: 'Les Corts',
        rating: 4.7,
        visited: false,
        description: 'Home of FC Barcelona, one of the largest stadiums in Europe',
        lat: 41.3709,
        lng: 2.1222,
        imageUrl: '/images/camp-nou.jpg',
        addedDate: new Date('2024-01-06')
      }
    ];
  }

  // Signal to hold all attractions
  readonly attractions = signal<Attraction[]>([]);

  // Computed signals for statistics
  readonly visitedCount = computed(() => 
    this.attractions().filter(a => a.visited).length
  );

  readonly remainingCount = computed(() => 
    this.attractions().filter(a => !a.visited).length
  );

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadAttractionsForUser(user.email);
      } else {
        this.attractions.set([]);
      }
    });
  }

  private getStorageKey(): string {
    const user = this.authService.currentUser();
    return user?.email ? `attractions_${user.email}` : 'attractions_guest';
  }

  /**
   * Load attractions for a specific user or initialize with defaults
   */
  private loadAttractionsForUser(email: string): void {
    const userKey = 'attractions_' + email;
    const stored = localStorage.getItem(userKey);
    
    if (stored) {
      this.attractions.set(JSON.parse(stored));
    } else {
      const defaultData = localStorage.getItem('visit_barcelona_attractions');
      if (defaultData) {
        const defaults = JSON.parse(defaultData);
        this.attractions.set(defaults);
        localStorage.setItem(userKey, JSON.stringify(defaults));
      } else {
        const hardcoded = this.getDefaultAttractions();
        this.attractions.set(hardcoded);
        localStorage.setItem(userKey, JSON.stringify(hardcoded));
      }
    }
  }

  /**
   * Persist attractions to localStorage
   */
  private persistToStorage(): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.attractions()));
  }

  /**
   * Get all attractions
   */
  getAll(): Attraction[] {
    return this.attractions();
  }

  /**
   * Get attraction by ID
   */
  getById(id: string): Attraction | undefined {
    return this.attractions().find(a => a.id === id);
  }

  /**
   * Add a new attraction
   */
  add(attraction: Omit<Attraction, 'id' | 'addedDate'>): void {
    const newAttraction: Attraction = {
      ...attraction,
      id: generateUUID(),
      addedDate: new Date()
    };

    this.attractions.update(current => [...current, newAttraction]);
    this.persistToStorage();
  }

  /**
   * Update an existing attraction
   */
  update(id: string, changes: Partial<Attraction>): void {
    this.attractions.update(current =>
      current.map(a => a.id === id ? { ...a, ...changes } : a)
    );
    this.persistToStorage();
  }

  /**
   * Delete an attraction
   */
  delete(id: string): void {
    this.attractions.update(current => current.filter(a => a.id !== id));
    this.persistToStorage();
  }

  /**
   * Search attractions by name, category, or district
   */
  search(term: string): Attraction[] {
    const lowerTerm = term.toLowerCase();
    return this.attractions().filter(a =>
      a.name.toLowerCase().includes(lowerTerm) ||
      a.category.toLowerCase().includes(lowerTerm) ||
      a.district.toLowerCase().includes(lowerTerm) ||
      a.description.toLowerCase().includes(lowerTerm)
    );
  }

  /**
   * Mark attraction as visited
   */
  markVisited(id: string): void {
    this.update(id, { visited: true });
  }

  /**
   * Mark attraction as not visited
   */
  markUnvisited(id: string): void {
    this.update(id, { visited: false });
  }
}
