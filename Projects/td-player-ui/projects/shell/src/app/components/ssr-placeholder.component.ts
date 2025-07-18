import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ssr-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ssr-placeholder.component.html',
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
