import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-fallback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fallback">
      <h3>Unable to Load Player Landing Page</h3>
      <p>The remote module could not be loaded. This might be because:</p>
      <ul>
        <li>The remote application is not running</li>
        <li>Network connectivity issues</li>
        <li>Configuration problems</li>
      </ul>
      <p>Please ensure the Player Landing Page application is running on port 4201.</p>
      <button routerLink="/" class="back-button">Back to Home</button>
    </div>
  `,
  styles: [`
    .fallback {
      padding: 2rem;
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      margin: 1rem;
    }
    
    .back-button {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      margin-top: 1rem;
    }
    
    .back-button:hover {
      background-color: #0056b3;
    }
  `]
})
export class FallbackComponent { }
