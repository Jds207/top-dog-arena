import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render welcome title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Welcome to Top Dog Arena');
  });

  it('should render hero subtitle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-subtitle')?.textContent).toContain('The ultimate NFT card gaming experience');
  });

  it('should render all feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureCards = compiled.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(4);
    
    const expectedFeatures = ['🎮 Play Games', '🏆 Join Tournaments', '💎 Collect NFTs', '📊 Track Stats'];
    featureCards.forEach((card, index) => {
      expect(card.querySelector('h3')?.textContent).toContain(expectedFeatures[index]);
    });
  });

  it('should have Enter Player Area button with correct route', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const enterButton = compiled.querySelector('button[routerLink="/player-landing-page"]');
    expect(enterButton).toBeTruthy();
    expect(enterButton?.textContent?.trim()).toBe('Enter Player Area');
  });

  it('should have Learn More button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const learnMoreButton = compiled.querySelector('.btn-secondary');
    expect(learnMoreButton).toBeTruthy();
    expect(learnMoreButton?.textContent?.trim()).toBe('Learn More');
  });

  it('should have proper CSS classes applied', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check main container
    const homeContainer = compiled.querySelector('.home-container');
    expect(homeContainer).toBeTruthy();
    
    // Check hero section
    const heroSection = compiled.querySelector('.hero-section');
    expect(heroSection).toBeTruthy();
    
    // Check feature grid
    const featureGrid = compiled.querySelector('.feature-grid');
    expect(featureGrid).toBeTruthy();
    
    // Check CTA section
    const ctaSection = compiled.querySelector('.cta-section');
    expect(ctaSection).toBeTruthy();
  });

  it('should have responsive design elements', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const ctaButtons = compiled.querySelector('.cta-buttons');
    expect(ctaButtons).toBeTruthy();
    
    const buttons = compiled.querySelectorAll('.btn');
    expect(buttons.length).toBe(2);
  });

  describe('Feature Cards Content', () => {
    it('should display correct content for Play Games card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const playGamesCard = compiled.querySelector('.feature-card:nth-child(1)');
      expect(playGamesCard?.querySelector('h3')?.textContent).toContain('🎮 Play Games');
      expect(playGamesCard?.querySelector('p')?.textContent).toContain('Engage in competitive card battles with your NFT collection');
    });

    it('should display correct content for Join Tournaments card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const tournamentsCard = compiled.querySelector('.feature-card:nth-child(2)');
      expect(tournamentsCard?.querySelector('h3')?.textContent).toContain('🏆 Join Tournaments');
      expect(tournamentsCard?.querySelector('p')?.textContent).toContain('Compete in tournaments to win rare cards and prizes');
    });

    it('should display correct content for Collect NFTs card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const nftsCard = compiled.querySelector('.feature-card:nth-child(3)');
      expect(nftsCard?.querySelector('h3')?.textContent).toContain('💎 Collect NFTs');
      expect(nftsCard?.querySelector('p')?.textContent).toContain('Build your unique collection of digital trading cards');
    });

    it('should display correct content for Track Stats card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const statsCard = compiled.querySelector('.feature-card:nth-child(4)');
      expect(statsCard?.querySelector('h3')?.textContent).toContain('📊 Track Stats');
      expect(statsCard?.querySelector('p')?.textContent).toContain('Monitor your performance and climb the leaderboards');
    });
  });
});
