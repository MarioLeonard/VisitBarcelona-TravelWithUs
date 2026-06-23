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
  templateUrl: './weather-widget.component.html',
  styleUrl: './weather-widget.component.scss'
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
