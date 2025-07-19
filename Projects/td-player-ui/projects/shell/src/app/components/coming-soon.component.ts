import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'coming-soon',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center px-4" 
         style="background: linear-gradient(135deg, rgb(var(--color-bg-primary)), rgb(var(--color-bg-secondary)), rgb(var(--color-bg-primary)));">
      <div class="max-w-4xl mx-auto text-center">
        
        <!-- Main Coming Soon Banner -->
        <div class="coming-soon-container backdrop-blur-lg rounded-3xl p-8 md:p-16 border shadow-2xl"
             style="background: linear-gradient(135deg, rgba(var(--color-bg-secondary), 0.9), rgba(var(--color-bg-tertiary), 0.9)); border-color: rgba(249, 115, 22, 0.3);">
          
          <!-- Icon & Title -->
          <div class="mb-8">
            <div class="text-8xl md:text-9xl mb-6 animate-bounce-slow">
              {{ pageIcon }}
            </div>
            <h1 class="text-4xl md:text-6xl font-bold mb-4 text-glow" style="color: rgb(var(--color-text-primary));">
              {{ pageTitle }}
            </h1>
            <div class="text-2xl md:text-3xl font-semibold mb-6" style="color: #f97316;">
              Coming Soon! 🚧
            </div>
          </div>
          
          <!-- Description -->
          <div class="mb-8">
            <p class="text-lg md:text-xl mb-6 max-w-2xl mx-auto leading-relaxed" style="color: rgb(var(--color-text-secondary));">
              {{ description }}
            </p>
            <p class="text-base max-w-xl mx-auto" style="color: rgb(var(--color-text-muted));">
              We're working hard to bring you the ultimate Top Dog Arena experience. 
              This feature is currently under development and will be available soon!
            </p>
          </div>
          
          <!-- Progress Indicator -->
          <div class="mb-8">
            <div class="text-sm mb-2" style="color: rgb(var(--color-text-muted));">Development Progress</div>
            <div class="progress-container rounded-full h-3 max-w-md mx-auto overflow-hidden" 
                 style="background-color: rgb(var(--color-bg-tertiary));">
              <div class="progress-bar bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-700 animate-pulse"
                   [style.width.%]="progressPercentage"></div>
            </div>
            <div class="text-xs mt-2" style="color: #f97316;">{{ progressPercentage }}% Complete</div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a routerLink="/" 
               class="btn-primary bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group">
              <span class="text-xl group-hover:scale-110 transition-transform">🏠</span>
              <span>Back to Arena</span>
            </a>
            
            <button 
              (click)="onNotifyMe()"
              class="btn-secondary font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group border-2"
              style="background-color: rgba(var(--color-bg-tertiary), 0.5); border-color: rgba(249, 115, 22, 0.3); color: rgb(var(--color-text-primary));"
              onmouseover="this.style.backgroundColor='rgba(var(--color-bg-secondary), 0.5)'; this.style.borderColor='rgba(249, 115, 22, 0.6)';"
              onmouseout="this.style.backgroundColor='rgba(var(--color-bg-tertiary), 0.5)'; this.style.borderColor='rgba(249, 115, 22, 0.3)';">
              <span class="text-xl group-hover:scale-110 transition-transform">🔔</span>
              <span>Notify Me</span>
            </button>
          </div>
          
          <!-- Features Preview -->
          <div class="features-preview" *ngIf="features && features.length > 0">
            <div class="text-lg font-semibold mb-4" style="color: rgb(var(--color-text-primary));">What's Coming:</div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div *ngFor="let feature of features" 
                   class="feature-card rounded-lg p-4 border transition-all duration-300"
                   style="background-color: rgba(var(--color-bg-tertiary), 0.3); border-color: rgba(var(--color-border), 0.5);"
                   onmouseover="this.style.borderColor='rgba(249, 115, 22, 0.5)';"
                   onmouseout="this.style.borderColor='rgba(var(--color-border), 0.5)';">
                <div class="text-2xl mb-2">{{ feature.icon }}</div>
                <div class="font-medium text-sm" style="color: rgb(var(--color-text-primary));">{{ feature.name }}</div>
                <div class="text-xs mt-1" style="color: rgb(var(--color-text-muted));">{{ feature.description }}</div>
              </div>
            </div>
          </div>
          
        </div>
        
        <!-- Bottom Links -->
        <div class="mt-8 flex flex-wrap justify-center gap-6 text-sm">
          <a routerLink="/tournaments" class="transition-colors hover:text-orange-400" style="color: rgb(var(--color-text-muted));">🏆 Tournaments</a>
          <a routerLink="/leaderboard" class="transition-colors hover:text-orange-400" style="color: rgb(var(--color-text-muted));">📊 Leaderboard</a>
          <a routerLink="/nft-marketplace" class="transition-colors hover:text-orange-400" style="color: rgb(var(--color-text-muted));">🎨 NFT Market</a>
          <a routerLink="/player-landing-page" class="transition-colors hover:text-orange-400" style="color: rgb(var(--color-text-muted));">🎮 Player Hub</a>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      position: relative;
      overflow: hidden;
    }
    
    .coming-soon-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(249, 115, 22, 0.05) 0%, transparent 50%, rgba(249, 115, 22, 0.05) 100%);
      z-index: -1;
    }
    
    .text-glow {
      text-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
    }
    
    .btn-primary, .btn-secondary {
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }
    
    .feature-card {
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-2px);
    }
    
    .progress-bar {
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
    }
    
    @keyframes bounce-slow {
      0%, 20%, 50%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-10px);
      }
      60% {
        transform: translateY(-5px);
      }
    }
    
    .animate-bounce-slow {
      animation: bounce-slow 3s infinite;
    }
    
    @media (max-width: 768px) {
      .features-preview {
        margin-top: 2rem;
      }
      
      .feature-card {
        text-align: center;
      }
    }
  `]
})
export class ComingSoonComponent {
  @Input() pageTitle: string = 'Feature';
  @Input() pageIcon: string = '🚧';
  @Input() description: string = 'This exciting feature is under development and will be available soon.';
  @Input() progressPercentage: number = 25;
  @Input() features: Array<{icon: string, name: string, description: string}> = [];
  
  onNotifyMe(): void {
    // TODO: Implement notification signup
    alert('🔔 Thanks! We\'ll notify you when this feature is ready!');
  }
}
