import { Component } from '@angular/core';
import { ComingSoonComponent } from './coming-soon.component';

@Component({
  selector: 'app-local-landing-page',
  standalone: true,
  imports: [ComingSoonComponent],
  templateUrl: './local-landing-page.component.html',
  styles: []
})
export class LocalLandingPageComponent {
  playerFeatures = [
    { icon: '👤', name: 'Player Profile & Statistics', description: 'Comprehensive player dashboard' },
    { icon: '⚔️', name: 'Battle History & Analytics', description: 'Track your arena performance' },
    { icon: '🎨', name: 'NFT Card Collection', description: 'Manage your digital cards' },
    { icon: '🏆', name: 'Tournament Registration', description: 'Join competitive events' },
    { icon: '📊', name: 'Leaderboard Rankings', description: 'See where you stand' },
    { icon: '🏅', name: 'Achievement System', description: 'Unlock rewards and badges' }
  ];
}
