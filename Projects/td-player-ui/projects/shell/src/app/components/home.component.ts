import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styles: [
    `
      .home-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .hero-section {
        text-align: center;
        padding: 4rem 2rem 2rem;
        background: rgba(0, 0, 0, 0.2);
      }

      .hero-section h1 {
        font-size: 3.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      }

      .hero-subtitle {
        font-size: 1.3rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }

      .content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
      }

      .features h2 {
        text-align: center;
        font-size: 2.5rem;
        margin-bottom: 3rem;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
        margin-bottom: 4rem;
      }

      .feature-card {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        transition:
          transform 0.3s ease,
          box-shadow 0.3s ease;
      }

      .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      }

      .feature-card h3 {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }

      .cta-section {
        text-align: center;
        padding: 3rem 0;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 16px;
      }

      .cta-section h2 {
        font-size: 2.2rem;
        margin-bottom: 1rem;
      }

      .cta-buttons {
        margin-top: 2rem;
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }

      .btn {
        padding: 1rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
      }

      .btn-primary {
        background: #ff6b6b;
        color: white;
      }

      .btn-primary:hover {
        background: #ee5a52;
        transform: translateY(-2px);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
      }

      @media (max-width: 768px) {
        .hero-section h1 {
          font-size: 2.5rem;
        }

        .feature-grid {
          grid-template-columns: 1fr;
        }

        .cta-buttons {
          flex-direction: column;
          align-items: center;
        }

        .btn {
          width: 200px;
        }
      }
    `,
  ],
})
export class HomeComponent {}
