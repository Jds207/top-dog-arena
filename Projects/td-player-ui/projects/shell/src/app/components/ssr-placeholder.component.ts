import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ssr-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="placeholder">
      <h3>Loading Player Landing Page...</h3>
      <p>
        This content will be loaded when the page is fully rendered in the
        browser.
      </p>
    </div>
  `,
  styles: [
    `
      .placeholder {
        padding: 2rem;
        text-align: center;
        background-color: #f5f5f5;
        border-radius: 8px;
        margin: 1rem;
      }
    `,
  ],
})
export class SsrPlaceholderComponent {}
