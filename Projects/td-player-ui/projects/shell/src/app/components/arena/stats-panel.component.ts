import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ArenaStats {
  totalVotesThisMonth: number;
  activeTopDogs: number;
  mostVotedPlayer: string;
  contestsThisWeek: number;
}

@Component({
  selector: 'stats-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="stats-section mb-8">
      <div class="text-center mb-8">
        <h2 class="text-2xl md:text-3xl font-bold mb-2" style="color: rgb(var(--color-text-primary));">
          📊 Arena Statistics
        </h2>
        <p style="color: #f97316;">Live stats from the battlefield</p>
      </div>
      
      <!-- Desktop Layout -->
      <div class="hidden md:grid md:grid-cols-4 gap-6">
        <div class="stat-card rounded-xl p-6 text-center border transition-all duration-300 hover:border-orange-500/50" 
             style="background-color: rgb(var(--color-bg-tertiary)); border-color: rgb(var(--color-border));">
          <div class="stat-icon text-4xl mb-4">🗳️</div>
          <div class="stat-value text-3xl font-bold mb-2" style="color: #f97316;">
            {{ formatNumber(stats.totalVotesThisMonth) }}
          </div>
          <div class="stat-label text-sm" style="color: rgb(var(--color-text-secondary));">
            Votes This Month
          </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-center border transition-all duration-300 hover:border-orange-500/50" 
             style="background-color: rgb(var(--color-bg-tertiary)); border-color: rgb(var(--color-border));">
          <div class="stat-icon text-4xl mb-4">🐕</div>
          <div class="stat-value text-3xl font-bold mb-2" style="color: #f97316;">
            {{ stats.activeTopDogs }}
          </div>
          <div class="stat-label text-sm" style="color: rgb(var(--color-text-secondary));">
            Active Top Dogs
          </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-center border transition-all duration-300 hover:border-orange-500/50" 
             style="background-color: rgb(var(--color-bg-tertiary)); border-color: rgb(var(--color-border));">
          <div class="stat-icon text-4xl mb-4">👑</div>
          <div class="stat-value text-lg font-bold mb-2" style="color: #f97316;">
            {{ stats.mostVotedPlayer }}
          </div>
          <div class="stat-label text-sm" style="color: rgb(var(--color-text-secondary));">
            Most Voted Player
          </div>
        </div>
        
        <div class="stat-card rounded-xl p-6 text-center border transition-all duration-300 hover:border-orange-500/50" 
             style="background-color: rgb(var(--color-bg-tertiary)); border-color: rgb(var(--color-border));">
          <div class="stat-icon text-4xl mb-4">⚔️</div>
          <div class="stat-value text-3xl font-bold mb-2" style="color: #f97316;">
            {{ stats.contestsThisWeek }}
          </div>
          <div class="stat-label text-slate-300 text-sm">
            Contests This Week
          </div>
        </div>
      </div>
      
      <!-- Mobile Horizontal Scroll -->
      <div class="md:hidden">
        <div class="flex gap-4 overflow-x-auto pb-4 stat-scroll">
          <div class="stat-card-mobile bg-slate-800 rounded-xl p-4 text-center border border-slate-600 min-w-[140px] flex-shrink-0">
            <div class="stat-icon text-2xl mb-2">🗳️</div>
            <div class="stat-value text-xl font-bold text-orange-500 mb-1">
              {{ formatNumber(stats.totalVotesThisMonth) }}
            </div>
            <div class="stat-label text-slate-300 text-xs">
              Votes This Month
            </div>
          </div>
          
          <div class="stat-card-mobile bg-slate-800 rounded-xl p-4 text-center border border-slate-600 min-w-[140px] flex-shrink-0">
            <div class="stat-icon text-2xl mb-2">🐕</div>
            <div class="stat-value text-xl font-bold text-orange-500 mb-1">
              {{ stats.activeTopDogs }}
            </div>
            <div class="stat-label text-slate-300 text-xs">
              Active Top Dogs
            </div>
          </div>
          
          <div class="stat-card-mobile bg-slate-800 rounded-xl p-4 text-center border border-slate-600 min-w-[140px] flex-shrink-0">
            <div class="stat-icon text-2xl mb-2">👑</div>
            <div class="stat-value text-sm font-bold text-orange-500 mb-1">
              {{ stats.mostVotedPlayer }}
            </div>
            <div class="stat-label text-slate-300 text-xs">
              Most Voted Player
            </div>
          </div>
          
          <div class="stat-card-mobile bg-slate-800 rounded-xl p-4 text-center border border-slate-600 min-w-[140px] flex-shrink-0">
            <div class="stat-icon text-2xl mb-2">⚔️</div>
            <div class="stat-value text-xl font-bold text-orange-500 mb-1">
              {{ stats.contestsThisWeek }}
            </div>
            <div class="stat-label text-slate-300 text-xs">
              Contests This Week
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .stat-card {
      transform: translateY(0);
      transition: all 0.3s ease;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8));
      backdrop-filter: blur(10px);
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 25px -5px rgba(249, 115, 22, 0.2);
    }
    
    .stat-card-mobile {
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.8));
      backdrop-filter: blur(10px);
    }
    
    .stat-scroll {
      scrollbar-width: thin;
      scrollbar-color: #f97316 #1e293b;
    }
    
    .stat-scroll::-webkit-scrollbar {
      height: 6px;
    }
    
    .stat-scroll::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 3px;
    }
    
    .stat-scroll::-webkit-scrollbar-thumb {
      background: #f97316;
      border-radius: 3px;
    }
    
    .stat-value {
      text-shadow: 0 0 10px rgba(249, 115, 22, 0.5);
    }
  `]
})
export class StatsPanelComponent {
  @Input() stats: ArenaStats = {
    totalVotesThisMonth: 25847,
    activeTopDogs: 342,
    mostVotedPlayer: 'MemeKing',
    contestsThisWeek: 8
  };
  
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
