import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'call-to-action',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="cta-section mb-8">
      <div class="cta-container bg-gradient-to-br from-orange-600 via-orange-700 to-red-700 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        <!-- Background Effects -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform skew-y-1"></div>
        <div class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
        
        <!-- Content -->
        <div class="relative z-10">
          <h2 class="text-2xl md:text-4xl font-bold mb-4 text-glow">
            🏟️ Join the Arena Battle!
          </h2>
          <p class="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Ready to become the next Top Dog? Nominate players, vote in battles, and claim exclusive NFTs!
          </p>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <button 
              (click)="onNominatePlayer()"
              class="cta-btn bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300 flex items-center justify-center space-x-2 group">
              <span class="text-2xl group-hover:scale-110 transition-transform">🎯</span>
              <span>Nominate Player</span>
            </button>
            
            <a routerLink="/leaderboard"
               class="cta-btn bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/30 hover:border-white/50 transition-all duration-300 flex items-center justify-center space-x-2 group">
              <span class="text-2xl group-hover:scale-110 transition-transform">🏆</span>
              <span>View Leaderboard</span>
            </a>
            
            <button 
              (click)="onClaimNFT()"
              class="cta-btn bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-yellow-400 text-white font-bold py-4 px-6 rounded-xl hover:from-yellow-400 hover:to-orange-400 hover:border-yellow-300 transition-all duration-300 flex items-center justify-center space-x-2 group sm:col-span-2 lg:col-span-1">
              <span class="text-2xl group-hover:scale-110 transition-transform">💎</span>
              <span>Claim NFT</span>
            </button>
          </div>
          
          <!-- Secondary Actions -->
          <div class="mt-8 flex flex-wrap justify-center gap-4">
            <a routerLink="/nft-marketplace"
               class="secondary-btn bg-transparent border border-white/50 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
              <span>🎨</span>
              <span>NFT Marketplace</span>
            </a>
            
            <a routerLink="/tournaments"
               class="secondary-btn bg-transparent border border-white/50 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
              <span>⚔️</span>
              <span>Tournaments</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .cta-container {
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(249, 115, 22, 0.4);
    }
    
    .cta-btn {
      min-height: 60px;
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    .cta-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    }
    
    .secondary-btn {
      transition: all 0.3s ease;
    }
    
    .secondary-btn:hover {
      transform: translateY(-1px);
    }
    
    .text-glow {
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.8);
    }
    
    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
      }
      50% {
        box-shadow: 0 0 30px rgba(249, 115, 22, 0.8);
      }
    }
    
    .cta-btn:last-child {
      animation: pulse-glow 2s infinite;
    }
    
    @media (max-width: 640px) {
      .cta-btn {
        min-height: 50px;
        font-size: 14px;
      }
    }
  `]
})
export class CallToActionComponent {
  @Output() nominatePlayer = new EventEmitter<void>();
  @Output() claimNFT = new EventEmitter<void>();
  
  onNominatePlayer(): void {
    this.nominatePlayer.emit();
  }
  
  onClaimNFT(): void {
    this.claimNFT.emit();
  }
}
