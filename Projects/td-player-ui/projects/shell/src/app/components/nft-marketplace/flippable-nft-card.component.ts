import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FlippableNFT {
  id: string;
  name: string;
  frontImage: string;
  backImage: string;
  rarity: string;
  price: number;
  currency: string;
  likes: number;
  attributes: Array<{trait_type: string, value: string | number, rarity: number}>;
}

@Component({
  selector: 'app-flippable-nft-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flippable-card" 
         [class.is-flipped]="isFlipped"
         (click)="onCardClick()">
      
      <!-- Card Inner Container -->
      <div class="card-inner">
        
        <!-- Front Side -->
        <div class="card-front">
          <div class="card-header">
            <div class="team-info">
              <span class="team-logo">🐕</span>
              <span class="team-name">Top Dogs</span>
            </div>
            <div class="rarity-badge" [ngStyle]="getRarityStyle()">
              {{ nft.rarity | titlecase }}
            </div>
          </div>
          
          <div class="card-image-section">
            <img [src]="nft.frontImage" [alt]="nft.name" class="player-image">
            <div class="flip-indicator">
              <span class="flip-text">Click to flip!</span>
            </div>
          </div>
          
          <div class="card-info-section">
            <h3 class="player-name">{{ nft.name }}</h3>
            <div class="player-position">{{ nft.attributes[2].value || 'Player' }}</div>
            
            <div class="card-stats">
              <div class="stats-grid">
                <div *ngFor="let attr of nft.attributes.slice(0, 2)" class="stat-box">
                  <div class="stat-label">{{ attr.trait_type }}</div>
                  <div class="stat-value">{{ attr.value }}</div>
                </div>
              </div>
            </div>
            
            <div class="card-bottom">
              <div class="price-section">
                <div class="price-value">{{ formatPrice() }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Back Side -->
        <div class="card-back">
          <div class="card-header">
            <div class="team-info">
              <span class="team-logo">🐕</span>
              <span class="team-name">Top Dogs</span>
            </div>
            <div class="rarity-badge" [ngStyle]="getRarityStyle()">
              {{ nft.rarity | titlecase }}
            </div>
          </div>
          
          <div class="card-image-section">
            <img [src]="nft.backImage" [alt]="nft.name + ' back'" class="player-image">
            <div class="flip-indicator">
              <span class="flip-text">Click to flip back!</span>
            </div>
          </div>
          
          <div class="card-info-section">
            <h3 class="player-name">{{ nft.name }}</h3>
            <div class="player-subtitle">Card Stats & Info</div>
            
            <div class="card-stats-detailed">
              <div class="stats-grid-back">
                <div *ngFor="let attr of nft.attributes" class="stat-box-detailed">
                  <div class="stat-label">{{ attr.trait_type }}</div>
                  <div class="stat-value">{{ attr.value }}</div>
                  <div class="stat-rarity">{{ attr.rarity }}% rarity</div>
                </div>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="action-btn like-btn" (click)="onLike($event)">
                ❤️ {{ nft.likes }}
              </button>
              <button class="action-btn buy-btn" (click)="onBuy($event)">
                💎 Buy Now
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styles: [`
    .flippable-card {
      width: 280px;
      height: 400px;
      perspective: 1000px;
      cursor: pointer;
      position: relative;
      margin: 1rem;
    }
    
    .card-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .flippable-card.is-flipped .card-inner {
      transform: rotateY(180deg);
    }
    
    .card-front,
    .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      border-radius: 16px;
      background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
      border: 2px solid #444;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .card-back {
      transform: rotateY(180deg);
    }
    
    .card-header {
      padding: 12px 16px;
      background: linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%);
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 50px;
    }
    
    .team-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    
    .team-logo {
      font-size: 18px;
    }
    
    .rarity-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
    }
    
    .card-image-section {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: linear-gradient(45deg, #333 0%, #555 100%);
    }
    
    .player-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 12px;
      transition: transform 0.3s ease;
    }
    
    .flippable-card:hover .player-image {
      transform: scale(1.05);
    }
    
    .flip-indicator {
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: rgba(255, 107, 53, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .flippable-card:hover .flip-indicator {
      opacity: 1;
    }
    
    .card-info-section {
      padding: 16px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      color: white;
    }
    
    .player-name {
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 4px 0;
      color: #ff6b35;
    }
    
    .player-position,
    .player-subtitle {
      font-size: 12px;
      color: #aaa;
      margin-bottom: 12px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .stats-grid-back {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 12px;
    }
    
    .stat-box,
    .stat-box-detailed {
      background: rgba(255, 107, 53, 0.1);
      border: 1px solid rgba(255, 107, 53, 0.3);
      border-radius: 6px;
      padding: 6px;
      text-align: center;
    }
    
    .stat-label {
      font-size: 10px;
      color: #ccc;
      margin-bottom: 2px;
    }
    
    .stat-value {
      font-size: 12px;
      font-weight: bold;
      color: #ff6b35;
    }
    
    .stat-rarity {
      font-size: 9px;
      color: #aaa;
      margin-top: 2px;
    }
    
    .price-section,
    .card-bottom {
      text-align: center;
    }
    
    .price-value {
      font-size: 16px;
      font-weight: bold;
      color: #ff6b35;
    }
    
    .card-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
    }
    
    .action-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .like-btn {
      background: rgba(255, 107, 53, 0.2);
      color: white;
      border: 1px solid #ff6b35;
    }
    
    .buy-btn {
      background: #ff6b35;
      color: white;
    }
    
    .action-btn:hover {
      transform: scale(1.05);
    }
    
    .like-btn:hover {
      background: rgba(255, 107, 53, 0.4);
    }
    
    .buy-btn:hover {
      background: #ff8c42;
    }
  `]
})
export class FlippableNftCardComponent {
  @Input() nft!: FlippableNFT;
  @Output() like = new EventEmitter<FlippableNFT>();
  @Output() buy = new EventEmitter<FlippableNFT>();
  
  isFlipped = false;
  
  onCardClick(): void {
    this.isFlipped = !this.isFlipped;
  }
  
  onLike(event: Event): void {
    event.stopPropagation();
    this.like.emit(this.nft);
  }
  
  onBuy(event: Event): void {
    event.stopPropagation();
    this.buy.emit(this.nft);
  }
  
  formatPrice(): string {
    return `${this.nft.price} ${this.nft.currency}`;
  }
  
  getRarityStyle(): any {
    const colors = {
      'common': '#8e8e93',
      'uncommon': '#34c759',
      'rare': '#007aff',
      'epic': '#af52de',
      'legendary': '#ff9500'
    };
    
    return {
      'background-color': colors[this.nft.rarity as keyof typeof colors] || colors.common
    };
  }
}
