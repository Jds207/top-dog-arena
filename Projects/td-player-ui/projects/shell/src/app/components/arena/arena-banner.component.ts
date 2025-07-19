import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'arena-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="relative w-screen left-1/2 -translate-x-1/2 mb-8">
      <div class="arena-banner-container bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-8 text-center">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 text-glow arena-title">
            🏟️ {{ contestTitle }}
          </h1>
          <div class="text-xl md:text-2xl text-orange-300 mb-2">
            {{ startDate }} - {{ endDate }}
          </div>
          <p class="text-lg text-slate-300 max-w-2xl mx-auto">
            {{ tagline }}
          </p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .arena-banner-container {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    .arena-banner-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(249, 115, 22, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
      z-index: 1;
    }
    
    .arena-banner-container > div {
      position: relative;
      z-index: 2;
    }
    
    .arena-title {
      text-shadow: 0 0 20px rgba(249, 115, 22, 0.8);
    }
    
    .text-glow {
      filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.6));
    }
  `]
})
export class ArenaBannerComponent {
  @Input() contestTitle: string = 'Top Meme Showdown';
  @Input() startDate: string = 'August 1, 2025';
  @Input() endDate: string = 'August 31, 2025';
  @Input() tagline: string = 'The ultimate battle arena where champions are made and legends are born';
}
