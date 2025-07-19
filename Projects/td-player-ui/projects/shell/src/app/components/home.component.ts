import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

// Import Arena Components
import { ArenaBannerComponent } from './arena/arena-banner.component';
import { BattleCardComponent } from './arena/battle-card.component';
import { StatsPanelComponent } from './arena/stats-panel.component';
import { CallToActionComponent } from './arena/call-to-action.component';
import { FooterPanelComponent } from './arena/footer-panel.component';

// Interfaces
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

interface ArenaStats {
  totalVotesThisMonth: number;
  activeTopDogs: number;
  mostVotedPlayer: string;
  contestsThisWeek: number;
}

interface FooterStats {
  nftsMinted: number;
  totalNFTs: number;
  monthlyLimit: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    ArenaBannerComponent, 
    BattleCardComponent, 
    StatsPanelComponent, 
    CallToActionComponent, 
    FooterPanelComponent
  ],
  templateUrl: './home.component.html',
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class HomeComponent implements OnInit {

  constructor(private titleService: Title) {}

  ngOnInit(): void {
    this.titleService.setTitle('Top Dog Arena - Battle Arena & NFT Marketplace');
  }
  
  // Mock data for current battle
  currentBattle: Battle = {
    id: 'featured-battle-aug-2025',
    leftPlayer: {
      id: 'player-meme-king',
      name: 'Meme King',
      thumbnailUrl: 'assets/images/battle-meme-king.svg',
      memePreview: 'When you realize you\'re the Top Dog of the arena',
      votes: 1847
    },
    rightPlayer: {
      id: 'player-comedy-queen',
      name: 'Comedy Queen',
      thumbnailUrl: 'assets/images/battle-comedy-queen.svg', 
      memePreview: 'That moment when your meme breaks the internet',
      votes: 1523
    },
    totalVotes: 3370,
    isActive: true
  };
  
  // Arena statistics
  arenaStats: ArenaStats = {
    totalVotesThisMonth: 25847,
    activeTopDogs: 342,
    mostVotedPlayer: 'MemeKing',
    contestsThisWeek: 8
  };
  
  // Footer statistics
  footerStats: FooterStats = {
    nftsMinted: 328,
    totalNFTs: 500,
    monthlyLimit: 500
  };
  
  // Event handlers
  onVoteSubmitted(playerId: string): void {
    console.log('Vote submitted for player:', playerId);
    // TODO: Implement vote submission logic
    // This would typically call an API service to submit the vote
    alert(`Vote submitted for player: ${playerId}! 🗳️`);
  }
  
  onNominatePlayer(): void {
    console.log('Nominate player clicked');
    // TODO: Navigate to player nomination form or open modal
    alert('Player nomination feature coming soon! 🎯');
  }
  
  onClaimNFT(): void {
    console.log('Claim NFT clicked'); 
    // TODO: Navigate to NFT claiming interface
    alert('NFT claiming feature coming soon! 💎');
  }
}
