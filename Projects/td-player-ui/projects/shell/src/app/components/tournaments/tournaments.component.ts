import { Component, OnInit } from '@angular/core';
import { ComingSoonComponent } from '../coming-soon.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-tournaments',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `
    <coming-soon
      pageTitle="Tournaments"
      pageIcon="🏆"
      description="Compete in epic battles and prove you're the Top Dog. Join ranked tournaments and climb your way to glory."
      [progressPercentage]="45"
      [features]="tournamentFeatures">
    </coming-soon>
  `
})
export class TournamentsComponent implements OnInit {
  
  constructor(private titleService: Title) {}
  
  ngOnInit(): void {
    this.titleService.setTitle('Tournaments - Coming Soon | Top Dog Arena');
  }
  tournamentFeatures = [
    { icon: '🏟️', name: 'Daily Tournaments', description: 'Compete in daily events' },
    { icon: '🎯', name: 'Ranked Competitions', description: 'Climb the competitive ladder' },
    { icon: '💰', name: 'Prize Pools & Rewards', description: 'Win valuable prizes' },
    { icon: '📋', name: 'Bracket System', description: 'Tournament-style elimination' },
    { icon: '📺', name: 'Live Match Streaming', description: 'Watch matches in real-time' },
    { icon: '📜', name: 'Tournament History', description: 'Review past competitions' }
  ];
}
