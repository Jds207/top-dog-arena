import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-local-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './local-landing-page.component.html',
  styles: [
    `
      .landing-page {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .content {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 1rem;
      }

      .features {
        margin-top: 1rem;
        padding: 1rem;
        background-color: white;
        border-radius: 6px;
        border-left: 4px solid #007bff;
      }

      ul {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }

      li {
        margin: 0.25rem 0;
      }

      h2 {
        color: #333;
        border-bottom: 2px solid #007bff;
        padding-bottom: 0.5rem;
      }

      h3,
      h4 {
        color: #555;
      }
    `,
  ],
})
export class LocalLandingPageComponent {}
