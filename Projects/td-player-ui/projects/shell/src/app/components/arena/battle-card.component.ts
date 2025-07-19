import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BattlePlayer {
  id: string;
  name: string;
  thumbnailUrl: string;
  memePreview: string;
  votes: number;
}

interface Battle {
  id: string;
  leftPlayer: BattlePlayer;
  rightPlayer: BattlePlayer;
  totalVotes: number;
  isActive: boolean;
}

@Component({
  selector: 'battle-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="battle-panel rounded-2xl border p-6 mb-8"
             style="background: linear-gradient(135deg, rgba(var(--color-bg-secondary), 0.9), rgba(var(--color-bg-tertiary), 0.8)); border-color: rgba(249, 115, 22, 0.3); backdrop-filter: blur(10px);">
      <div class="text-center mb-6">
        <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color: rgb(var(--color-text-primary));">
          ⚔️ Featured Battle
        </h2>
        <p style="color: #f97316;">Vote for your favorite Top Dog!</p>
      </div>
      
      <div class="battle-container grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <!-- Left Player -->
        <div class="battle-player text-center group cursor-pointer" 
             (click)="onVote(battle.leftPlayer.id)"
             (mouseenter)="hoveredPlayer = 'left'"
             (mouseleave)="hoveredPlayer = null">
          <div class="player-card rounded-xl p-4 border-2 transition-all duration-300"
               style="background-color: rgb(var(--color-bg-tertiary));"
               [style.border-color]="hoveredPlayer === 'left' ? '#f97316' : 'rgb(var(--color-border))'">
            <div class="player-thumbnail mb-4 relative overflow-hidden rounded-lg">
              <img [src]="battle.leftPlayer.thumbnailUrl" 
                   [alt]="battle.leftPlayer.name"
                   class="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <h3 class="text-lg font-bold mb-2" style="color: rgb(var(--color-text-primary));">{{ battle.leftPlayer.name }}</h3>
            <div class="meme-preview text-sm mb-3 italic" style="color: rgb(var(--color-text-secondary));">
              "{{ battle.leftPlayer.memePreview }}"
            </div>
            <button class="vote-btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full">
              Vote! 🐕
            </button>
          </div>
        </div>

        <!-- VS Section -->
        <div class="vs-section text-center">
          <div class="text-4xl md:text-6xl font-bold mb-4" style="color: #f97316;">VS</div>
          
          <!-- Progress Bar -->
          <div class="vote-progress mb-4">
            <div class="flex justify-between text-sm mb-2" style="color: rgb(var(--color-text-secondary));">
              <span>{{ leftPercentage }}%</span>
              <span>{{ rightPercentage }}%</span>
            </div>
            <div class="progress-bar rounded-full h-4 overflow-hidden" style="background-color: rgb(var(--color-bg-tertiary));">
              <div class="progress-left bg-orange-500 h-full transition-all duration-500"
                   [style.width.%]="leftPercentage"></div>
            </div>
            <div class="text-xs mt-2" style="color: rgb(var(--color-text-muted));">
              {{ battle.totalVotes }} total votes
            </div>
          </div>
        </div>

        <!-- Right Player -->
        <div class="battle-player text-center group cursor-pointer" 
             (click)="onVote(battle.rightPlayer.id)"
             (mouseenter)="hoveredPlayer = 'right'"
             (mouseleave)="hoveredPlayer = null">
          <div class="player-card rounded-xl p-4 border-2 transition-all duration-300"
               style="background-color: rgb(var(--color-bg-tertiary));"
               [style.border-color]="hoveredPlayer === 'right' ? '#f97316' : 'rgb(var(--color-border))'">
            <div class="player-thumbnail mb-4 relative overflow-hidden rounded-lg">
              <img [src]="battle.rightPlayer.thumbnailUrl" 
                   [alt]="battle.rightPlayer.name"
                   class="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <h3 class="text-lg font-bold mb-2" style="color: rgb(var(--color-text-primary));">{{ battle.rightPlayer.name }}</h3>
            <div class="meme-preview text-sm mb-3 italic" style="color: rgb(var(--color-text-secondary));">
              "{{ battle.rightPlayer.memePreview }}"
            </div>
            <button class="vote-btn bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors w-full">
              Vote! 🐕
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .battle-panel {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(51, 65, 85, 0.8));
      backdrop-filter: blur(10px);
    }
    
    .player-card {
      transform: translateY(0);
      transition: all 0.3s ease;
    }
    
    .player-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(249, 115, 22, 0.3);
    }
    
    .vote-btn:hover {
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
    }
    
    .progress-bar {
      position: relative;
      background: linear-gradient(to right, #ef4444 0%, #ef4444 50%, #3b82f6 50%, #3b82f6 100%);
    }
    
    .progress-left {
      background: linear-gradient(90deg, #f97316, #ea580c);
    }
    
    @media (max-width: 768px) {
      .battle-container {
        grid-template-columns: 1fr;
      }
      .vs-section {
        order: 2;
      }
    }
  `]
})
export class BattleCardComponent {
  @Input() battle: Battle = {
    id: 'battle-1',
    leftPlayer: {
      id: 'player-1',
      name: 'Meme King',
      thumbnailUrl: 'images/player-1.jpg',
      memePreview: 'When you realize you\'re the Top Dog',
      votes: 150
    },
    rightPlayer: {
      id: 'player-2',
      name: 'Comedy Queen',
      thumbnailUrl: 'images/player-2.jpg',
      memePreview: 'That feeling when you dominate the arena',
      votes: 120
    },
    totalVotes: 270,
    isActive: true
  };
  
  @Output() voteSubmitted = new EventEmitter<string>();
  
  hoveredPlayer: string | null = null;
  
  get leftPercentage(): number {
    return this.battle.totalVotes > 0 ? Math.round((this.battle.leftPlayer.votes / this.battle.totalVotes) * 100) : 50;
  }
  
  get rightPercentage(): number {
    return this.battle.totalVotes > 0 ? Math.round((this.battle.rightPlayer.votes / this.battle.totalVotes) * 100) : 50;
  }
  
  onVote(playerId: string): void {
    this.voteSubmitted.emit(playerId);
  }
}
