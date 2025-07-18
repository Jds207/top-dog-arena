import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-local-landing-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="landing-page">
      <h2>Player Landing Page</h2>
      <p>Welcome to the Top Dog Arena Player Landing Page!</p>
      <div class="content">
        <h3>Getting Started</h3>
        <p>This is the local version of the landing page component.</p>
        <p>In a full module federation setup, this would be loaded from the remote application.</p>
        
        <div class="features">
          <h4>Features Coming Soon:</h4>
          <ul>
            <li>Player Registration</li>
            <li>Game Statistics</li>
            <li>Tournament Information</li>
            <li>NFT Card Collection</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
    
    h3, h4 {
      color: #555;
    }
  `]
})
export class LandingPageComponent { }
