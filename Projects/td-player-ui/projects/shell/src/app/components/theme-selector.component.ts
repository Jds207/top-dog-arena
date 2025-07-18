import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, type Theme } from '../services/theme.service';

@Component({
  selector: 'app-theme-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-selector">
      <div class="theme-selector-header">
        <h3 class="theme-title">🎨 Choose Your Arena Theme</h3>
        <p class="theme-description">Customize your Top Dog Arena experience</p>
      </div>
      
      <div class="theme-grid">
        <button
          *ngFor="let theme of availableThemes()"
          (click)="selectTheme(theme.id)"
          [class.active]="isActive(theme.id)"
          [attr.aria-label]="'Switch to ' + theme.name + ' theme'"
          class="theme-option"
          type="button"
        >
          <div class="theme-preview" [attr.data-theme]="theme.id">
            <span class="theme-icon">{{ theme.icon }}</span>
            <div class="theme-colors">
              <div class="color-sample primary"></div>
              <div class="color-sample secondary"></div>
              <div class="color-sample accent"></div>
            </div>
          </div>
          
          <div class="theme-info">
            <h4 class="theme-name">{{ theme.name }}</h4>
            <p class="theme-desc">{{ theme.description }}</p>
          </div>
          
          <div class="active-indicator" *ngIf="isActive(theme.id)">
            ✓ Active
          </div>
        </button>
      </div>
      
      <div class="theme-actions">
        <button 
          (click)="toggleDarkMode()" 
          class="btn-secondary"
          type="button"
          [attr.aria-label]="'Toggle between light and dark mode'"
        >
          {{ isDarkMode() ? '☀️' : '🌙' }} Toggle Dark Mode
        </button>
        
        <button 
          (click)="cycleTheme()" 
          class="btn-primary"
          type="button"
          [attr.aria-label]="'Cycle through all themes'"
        >
          🔄 Cycle Themes
        </button>
        
        <button 
          (click)="resetTheme()" 
          class="btn-danger"
          type="button"
          [attr.aria-label]="'Reset to default theme'"
        >
          🔄 Reset
        </button>
      </div>
    </div>
  `,
  styles: [`
    .theme-selector {
      @apply bg-bg-secondary border border-border rounded-xl p-6 max-w-4xl mx-auto;
    }

    .theme-selector-header {
      @apply text-center mb-6;
    }

    .theme-title {
      @apply text-2xl font-bold text-text-primary mb-2;
    }

    .theme-description {
      @apply text-text-secondary;
    }

    .theme-grid {
      @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6;
    }

    .theme-option {
      @apply relative bg-bg-tertiary border border-border-light rounded-lg p-4 transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-tda-primary-500 focus:ring-offset-2;
      
      &:hover {
        @apply scale-105 border-tda-primary-400;
      }
      
      &.active {
        @apply border-tda-primary-500 bg-tda-primary-50 dark:bg-tda-primary-900/20;
      }
    }

    .theme-preview {
      @apply flex items-center justify-between mb-3;
    }

    .theme-icon {
      @apply text-2xl;
    }

    .theme-colors {
      @apply flex gap-1;
    }

    .color-sample {
      @apply w-3 h-3 rounded-full;
      
      &.primary {
        @apply bg-tda-primary-500;
      }
      
      &.secondary {
        @apply bg-tda-secondary-500;
      }
      
      &.accent {
        @apply bg-tda-accent-500;
      }
    }

    /* Theme-specific color samples */
    .theme-preview[data-theme="gaming"] {
      .color-sample.primary { @apply bg-green-500; }
      .color-sample.secondary { @apply bg-green-400; }
      .color-sample.accent { @apply bg-green-300; }
    }

    .theme-preview[data-theme="arena"] {
      .color-sample.primary { @apply bg-red-600; }
      .color-sample.secondary { @apply bg-red-500; }
      .color-sample.accent { @apply bg-red-400; }
    }

    .theme-preview[data-theme="neon"] {
      .color-sample.primary { @apply bg-purple-600; }
      .color-sample.secondary { @apply bg-purple-500; }
      .color-sample.accent { @apply bg-purple-400; }
    }

    .theme-info {
      @apply text-center;
    }

    .theme-name {
      @apply font-semibold text-text-primary text-sm mb-1;
    }

    .theme-desc {
      @apply text-xs text-text-muted;
    }

    .active-indicator {
      @apply absolute top-2 right-2 bg-tda-accent-500 text-white text-xs px-2 py-1 rounded-full font-medium;
    }

    .theme-actions {
      @apply flex flex-wrap gap-3 justify-center pt-4 border-t border-border-light;
    }

    /* Gaming theme enhancements */
    .theme-gaming .theme-option.active {
      @apply shadow-lg;
      box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
    }

    /* Arena theme enhancements */
    .theme-arena .theme-option.active {
      @apply shadow-lg;
      box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
    }

    /* Neon theme enhancements */
    .theme-neon .theme-option.active {
      @apply shadow-lg;
      box-shadow: 0 4px 20px rgba(147, 51, 234, 0.5);
      border: 1px solid rgba(147, 51, 234, 0.5);
    }

    @media (max-width: 640px) {
      .theme-grid {
        @apply grid-cols-1;
      }
      
      .theme-actions {
        @apply flex-col;
        
        button {
          @apply w-full;
        }
      }
    }
  `]
})
export class ThemeSelectorComponent {
  private readonly themeService = inject(ThemeService);
  
  // Computed properties from service
  readonly availableThemes = computed(() => this.themeService.availableThemes());
  readonly currentTheme = computed(() => this.themeService.theme());
  readonly isDarkMode = computed(() => this.themeService.isDarkMode());

  /**
   * Select a specific theme
   */
  selectTheme(theme: Theme): void {
    try {
      this.themeService.setTheme(theme);
      console.log(`Theme selected: ${theme}`);
    } catch (error) {
      console.error('Error selecting theme:', error);
    }
  }

  /**
   * Check if a theme is currently active
   */
  isActive(theme: Theme): boolean {
    return this.themeService.isThemeActive(theme);
  }

  /**
   * Toggle between light and dark modes
   */
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  /**
   * Cycle through all available themes
   */
  cycleTheme(): void {
    this.themeService.cycleTheme();
  }

  /**
   * Reset theme to default
   */
  resetTheme(): void {
    this.themeService.resetTheme();
  }
}
