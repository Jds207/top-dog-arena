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
}
