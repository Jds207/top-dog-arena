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
      .text-glow {
        text-shadow: 0 0 20px rgba(var(--tda-primary-500-rgb), 0.6);
      }
      
      .feature-card {
        transition: all 0.3s ease-in-out;
      }
      
      .feature-card:hover {
        box-shadow: 0 10px 25px rgba(var(--tda-primary-500-rgb), 0.1);
      }

      /* Enhanced mobile responsiveness */
      @media (max-width: 640px) {
        .feature-card {
          min-height: 160px;
        }
        
        .text-4xl {
          font-size: 3rem;
        }
        
        .text-6xl {
          font-size: 3.5rem;
        }
      }

      /* Smooth animations */
      .feature-card {
        animation: fadeInUp 0.6s ease-out;
      }

      .feature-card:nth-child(1) { animation-delay: 0.1s; }
      .feature-card:nth-child(2) { animation-delay: 0.2s; }
      .feature-card:nth-child(3) { animation-delay: 0.3s; }
      .feature-card:nth-child(4) { animation-delay: 0.4s; }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Accessibility improvements */
      .feature-card:focus-within {
        outline: 2px solid var(--tda-primary-500);
        outline-offset: 2px;
      }

      /* Loading states */
      .feature-card {
        position: relative;
        overflow: hidden;
      }

      .feature-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        transition: left 0.5s;
      }

      .feature-card:hover::before {
        left: 100%;
      }
    `
  ]
})
export class HomeComponent { }
