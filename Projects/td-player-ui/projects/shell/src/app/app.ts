import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('shell');
  protected readonly currentYear = new Date().getFullYear();
  protected readonly isMobileMenuOpen = signal(false);

  constructor(protected themeService: ThemeService) {}

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected cycleTheme(): void {
    const themes = this.themeService.availableThemes();
    const currentIndex = themes.findIndex(t => t.id === this.themeService.theme());
    const nextIndex = (currentIndex + 1) % themes.length;
    this.themeService.setTheme(themes[nextIndex].id);
  }
}
