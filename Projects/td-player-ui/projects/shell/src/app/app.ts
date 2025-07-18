import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeSelectorComponent } from './components/theme-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ThemeSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('shell');
  protected readonly currentYear = new Date().getFullYear();
  protected readonly isMobileMenuOpen = signal(false);

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
