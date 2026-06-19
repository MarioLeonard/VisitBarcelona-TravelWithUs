import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

export interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);

  // Barcelona coordinates
  private readonly LAT = 41.3828;
  private readonly LON = 2.1774;
  private readonly CITY_NAME = 'Barcelona';
  
  // OpenWeatherMap API - Free tier (1M calls/month)
  private readonly API_KEY = '4f0e10fcaf53fadba8577d36666f1c1c'; // Replace with actual key in production
  private readonly API_BASE = 'https://api.openweathermap.org/data/2.5/weather';
  
  // Cache settings
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private lastCacheTime = 0;
  
  // Signals for reactive updates
  private weatherData = signal<WeatherData | null>(null);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);
  
  // Computed signals
  weatherInfo = computed(() => this.weatherData());
  loading = computed(() => this.isLoading());
  hasError = computed(() => this.error());
  
  constructor() {
    // Try to load weather on initialization
    this.loadWeather();
  }

  loadWeather(): void {
    // Check if cache is still valid
    const now = Date.now();
    if (this.weatherData() && (now - this.lastCacheTime) < this.CACHE_DURATION) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      lat: this.LAT.toString(),
      lon: this.LON.toString(),
      units: 'metric',
      appid: this.API_KEY
    };

    this.http.get<any>(this.API_BASE, { params })
      .pipe(
        tap((response) => {
          const weather = this.mapWeatherResponse(response);
          this.weatherData.set(weather);
          this.lastCacheTime = now;
          this.isLoading.set(false);
        }),
        catchError((err) => {
          console.error('Weather API error:', err);
          this.isLoading.set(false);
          // Fall back to demo data on error
          this.loadDemoWeather();
          this.error.set(null); // Clear error after loading demo data
          return of(null);
        })
      )
      .subscribe();
  }

  private loadDemoWeather(): void {
    // Demo/fallback weather data for Barcelona
    const demoWeather: WeatherData = {
      temp: 22,
      condition: 'Partly Cloudy',
      icon: '02d',
      humidity: 65,
      windSpeed: 3.5,
      description: 'Partly cloudy with clear skies'
    };
    this.weatherData.set(demoWeather);
    this.isLoading.set(false);
  }

  private mapWeatherResponse(response: any): WeatherData {
    return {
      temp: Math.round(response.main.temp),
      condition: response.weather[0].main,
      icon: response.weather[0].icon,
      humidity: response.main.humidity,
      windSpeed: parseFloat((response.wind.speed * 3.6).toFixed(1)), // m/s to km/h
      description: response.weather[0].description
    };
  }

  // Helper to get weather icon URL
  getWeatherIconUrl(icon: string): string {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  }

  // Helper to get display icon based on condition
  getDisplayIcon(icon: string): string {
    // Map OpenWeatherMap icons to ng-zorro icons
    const iconMap: { [key: string]: string } = {
      '01d': 'sun', // clear sky day
      '01n': 'star', // clear sky night
      '02d': 'cloud', // few clouds day
      '02n': 'cloud', // few clouds night
      '03d': 'cloud', // scattered clouds
      '03n': 'cloud',
      '04d': 'cloud', // broken clouds
      '04n': 'cloud',
      '09d': 'cloudDownload', // shower rain
      '09n': 'cloudDownload',
      '10d': 'cloudDownload', // rain day
      '10n': 'cloudDownload', // rain night
      '11d': 'cloudLightning', // thunderstorm
      '11n': 'cloudLightning',
      '13d': 'cloudSnow', // snow
      '13n': 'cloudSnow',
      '50d': 'cloudFog', // mist
      '50n': 'cloudFog'
    };
    return iconMap[icon] || 'cloud';
  }
}
