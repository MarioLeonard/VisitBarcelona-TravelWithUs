import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { WeatherService } from '@app/core/services/weather.service';

@Component({
  selector: 'app-weather-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzCardModule,
    NzIconModule,
    NzSpaceModule,
    NzButtonModule,
    NzSkeletonModule
  ],
  template: `
    <nz-card class="weather-card">
      <div class="weather-content">
        <!-- Loading State -->
        @if (weatherService.loading()) {
          <nz-skeleton [nzActive]="true" [nzParagraph]="{ rows: 2 }"></nz-skeleton>
        }

        <!-- Error State -->
        @if (weatherService.hasError() && !weatherService.loading()) {
          <div class="weather-error">
            <span nz-icon nzType="warning" nzTheme="outline"></span>
            <p>Unable to load weather</p>
            <button nz-button nzType="link" nzSize="small" (click)="retry()">
              Retry
            </button>
          </div>
        }

        <!-- Weather Display -->
        @if (weatherService.weatherInfo() && !weatherService.loading()) {
          <div class="weather-main">
            <!-- Temperature and Condition -->
            <div class="temp-section">
              <div class="temperature">
                {{ weatherService.weatherInfo()!.temp }}°C
              </div>
              <div class="condition">
                {{ weatherService.weatherInfo()!.condition }}
              </div>
            </div>

            <!-- Weather Icon -->
            <div class="weather-icon-wrapper">
              <span 
                nz-icon 
                [nzType]="getDisplayIcon(weatherService.weatherInfo()!.icon)" 
                nzTheme="outline"
                class="weather-icon"
              ></span>
              <p class="description">
                {{ weatherService.weatherInfo()!.description }}
              </p>
            </div>
          </div>

          <div class="weather-details">
            <div class="detail-item">
              <div class="detail-text">
                <span class="detail-label">Humidity</span>
                <span class="detail-value">{{ weatherService.weatherInfo()!.humidity }}%</span>
              </div>
            </div>

            <div class="detail-item">
              <div class="detail-text">
                <span class="detail-label">Wind</span>
                <span class="detail-value">{{ weatherService.weatherInfo()!.windSpeed }} km/h</span>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="location">
            <span nz-icon nzType="environment" nzTheme="fill"></span>
            Barcelona
          </div>
        }
      </div>
    </nz-card>
  `,
  styles: [`
    .weather-card {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      transition: background 0.3s ease, border-color 0.3s ease;
    }

    :host-context(:root.dark-mode) .weather-card {
      background: linear-gradient(135deg, #12122a 0%, #1a1a38 100%) !important;
      border-color: #2e2e55 !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
    }

    ::ng-deep .weather-card .ant-card-body {
      padding: 1.5rem 1rem;
    }

    .weather-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .weather-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      text-align: center;
      color: #ff4d4f;
    }

    .weather-error span {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .weather-error p {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .weather-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0;
    }

    .temp-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .temperature {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      color: #262626;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .temperature {
      color: #e8eaf6;
    }

    .condition {
      font-size: 0.9rem;
      font-weight: 500;
      color: #595959;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .condition {
      color: #a0a8d0;
    }

    .description {
      font-size: 0.75rem;
      color: #999;
      margin: 0.25rem 0 0 0;
      font-style: normal;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .description {
      color: #606488;
    }

    .weather-icon-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .weather-icon {
      font-size: 1.8rem !important;
      color: #1890ff;
    }

    .weather-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 0.75rem 0 0 0;
      border-top: 1px solid #f0f0f0;
      transition: border-color 0.3s ease;
    }

    :host-context(:root.dark-mode) .weather-details {
      border-top-color: #2a2a4a;
    }

    .detail-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .detail-icon {
      font-size: 1.2rem;
    }

    .detail-icon.humidity {
      color: #1890ff;
    }

    .detail-icon.wind {
      color: #52c41a;
    }

    .detail-text {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.7rem;
      color: #999;
      font-weight: 500;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .detail-label {
      color: #606488;
    }

    .detail-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #262626;
      transition: color 0.3s ease;
    }

    :host-context(:root.dark-mode) .detail-value {
      color: #c8d0e8;
    }

    .location {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      padding: 0.5rem 0;
      font-size: 0.8rem;
      color: #262626;
      font-weight: 500;
      border-top: 1px solid #f0f0f0;
      margin-top: 0.75rem;
      transition: color 0.3s ease, border-color 0.3s ease;
    }

    :host-context(:root.dark-mode) .location {
      color: #a0a8d0;
      border-top-color: #2a2a4a;
    }

    @media (max-width: 768px) {
      .weather-main {
        flex-direction: column;
        text-align: center;
        padding: 1rem;
      }

      .temperature {
        font-size: 2rem;
      }

      .condition {
        font-size: 1rem;
      }

      .weather-icon {
        font-size: 3rem !important;
      }

      .weather-details {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WeatherWidgetComponent {
  weatherService = inject(WeatherService);

  retry(): void {
    this.weatherService.loadWeather();
  }

  getDisplayIcon(icon: string): string {
    return this.weatherService.getDisplayIcon(icon);
  }
}
