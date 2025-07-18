import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'gaming' | 'arena' | 'neon';

export interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  icon: string;
  colorScheme: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_STORAGE_KEY = 'tda-theme';
  
  /**
   * Available themes for Top Dog Arena
   */
  private readonly themes: ThemeConfig[] = [
    {
      id: 'light',
      name: 'Classic Light',
      description: 'Clean and professional light theme',
      icon: '☀️',
      colorScheme: 'light'
    },
    {
      id: 'dark',
      name: 'Classic Dark',
      description: 'Easy on the eyes dark theme',
      icon: '🌙',
      colorScheme: 'dark'
    },
    {
      id: 'gaming',
      name: 'Gaming Matrix',
      description: 'Green matrix-style gaming theme',
      icon: '🎮',
      colorScheme: 'dark'
    },
    {
      id: 'arena',
      name: 'Battle Arena',
      description: 'Bold red arena combat theme',
      icon: '⚔️',
      colorScheme: 'dark'
    },
    {
      id: 'neon',
      name: 'Neon Cyberpunk',
      description: 'Futuristic purple neon theme',
      icon: '🌟',
      colorScheme: 'dark'
    }
  ];

  // Current theme signal
  private currentTheme = signal<Theme>(this.getInitialTheme());
  
  // Computed properties
  readonly theme = computed(() => this.currentTheme());
  readonly themeConfig = computed(() => 
    this.themes.find(t => t.id === this.currentTheme()) || this.themes[0]
  );
  readonly availableThemes = computed(() => this.themes);
  readonly isDarkMode = computed(() => 
    this.themeConfig().colorScheme === 'dark'
  );

  constructor() {
    // Apply theme changes to document
    effect(() => {
      this.applyTheme(this.currentTheme());
    });
  }

  /**
   * Get initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
      return 'light'; // SSR default
    }

    // Check localStorage first
    const stored = localStorage.getItem(this.THEME_STORAGE_KEY) as Theme;
    if (stored && this.themes.some(t => t.id === stored)) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply theme to document with defensive programming
   */
  private applyTheme(theme: Theme): void {
    try {
      if (typeof document === 'undefined') {
        console.warn('Document not available, skipping theme application');
        return;
      }

      const body = document.body;
      if (!body) {
        console.error('Document body not found');
        return;
      }

      // Remove all theme classes
      body.classList.remove('dark', 'theme-gaming', 'theme-arena', 'theme-neon');
      
      // Add new theme class
      switch (theme) {
        case 'dark':
          body.classList.add('dark');
          break;
        case 'gaming':
          body.classList.add('dark', 'theme-gaming');
          break;
        case 'arena':
          body.classList.add('dark', 'theme-arena');
          break;
        case 'neon':
          body.classList.add('dark', 'theme-neon');
          break;
        case 'light':
        default:
          // Light theme is default, no classes needed
          break;
      }

      // Store in localStorage
      try {
        localStorage.setItem(this.THEME_STORAGE_KEY, theme);
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }

      console.log(`Theme applied: ${theme}`);
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  }

  /**
   * Set the current theme
   */
  setTheme(theme: Theme): void {
    if (!this.themes.some(t => t.id === theme)) {
      console.error(`Invalid theme: ${theme}`);
      return;
    }

    this.currentTheme.set(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleDarkMode(): void {
    const current = this.currentTheme();
    const newTheme = current === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Cycle through all available themes
   */
  cycleTheme(): void {
    const currentIndex = this.themes.findIndex(t => t.id === this.currentTheme());
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex].id);
  }

  /**
   * Get theme by ID with fallback
   */
  getThemeConfig(themeId: Theme): ThemeConfig {
    return this.themes.find(t => t.id === themeId) || this.themes[0];
  }

  /**
   * Check if a theme is currently active
   */
  isThemeActive(themeId: Theme): boolean {
    return this.currentTheme() === themeId;
  }

  /**
   * Reset to system preference or default
   */
  resetTheme(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.THEME_STORAGE_KEY);
    }
    this.currentTheme.set(this.getInitialTheme());
  }
}
