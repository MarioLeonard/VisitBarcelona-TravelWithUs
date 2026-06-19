import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme = signal<Theme>('light');

  // Computed signal for easy access
  theme = computed(() => this.currentTheme());
  isDarkMode = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Load theme from localStorage on initialization
    this.loadThemePreference();
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    this.saveThemePreference(theme);
  }

  private applyTheme(theme: Theme): void {
    // Add/remove dark-mode class to html element
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  private saveThemePreference(theme: Theme): void {
    localStorage.setItem('theme', theme);
  }
}
