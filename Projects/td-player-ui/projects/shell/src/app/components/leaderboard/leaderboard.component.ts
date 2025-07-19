import { Component, OnInit } from '@angular/core';
import { ComingSoonComponent } from '../coming-soon.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `
    <coming-soon
      pageTitle="Leaderboard"
      pageIcon="📊"
      description="See who rules the arena. Track rankings, stats, and achievements of the top players worldwide."
      [progressPercentage]="55"
      [features]="leaderboardFeatures">
    </coming-soon>
  `
})
export class LeaderboardComponent implements OnInit {
  
  constructor(private titleService: Title) {}
  
  ngOnInit(): void {
    this.titleService.setTitle('Leaderboard - Coming Soon | Top Dog Arena');
  }
  leaderboardFeatures = [
    { icon: '🌍', name: 'Global Rankings', description: 'Worldwide player standings' },
    { icon: '📈', name: 'Player Statistics', description: 'Detailed performance metrics' },
    { icon: '🏆', name: 'Achievement Tracking', description: 'Monitor your progress' },
    { icon: '📊', name: 'Historical Performance', description: 'Track performance over time' },
    { icon: '🌎', name: 'Region Filters', description: 'View local and regional rankings' },
    { icon: '📅', name: 'Season Records', description: 'Seasonal performance tracking' }
  ];
}
