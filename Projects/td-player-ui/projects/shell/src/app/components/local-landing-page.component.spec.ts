import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalLandingPageComponent } from './local-landing-page.component';
import { CommonModule } from '@angular/common';

describe('LocalLandingPageComponent', () => {
  let component: LocalLandingPageComponent;
  let fixture: ComponentFixture<LocalLandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LocalLandingPageComponent, CommonModule]
    });
    fixture = TestBed.createComponent(LocalLandingPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const h2Element = compiled.querySelector('h2');
    expect(h2Element?.textContent).toBe('Player Landing Page');
  });

  it('should render the welcome message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const welcomeText = compiled.querySelector('.landing-page > p');
    expect(welcomeText?.textContent).toBe('Welcome to the Top Dog Arena Player Landing Page!');
  });

  it('should render the Getting Started section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const h3Element = compiled.querySelector('h3');
    expect(h3Element?.textContent).toBe('Getting Started');
  });

  it('should render the content section with proper class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const contentDiv = compiled.querySelector('.content');
    expect(contentDiv).toBeTruthy();
  });

  it('should render the features section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const featuresDiv = compiled.querySelector('.features');
    expect(featuresDiv).toBeTruthy();
    
    const h4Element = featuresDiv?.querySelector('h4');
    expect(h4Element?.textContent).toBe('Features Coming Soon:');
  });

  it('should render all feature list items', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('.features ul li');
    
    expect(listItems.length).toBe(4);
    expect(listItems[0].textContent).toBe('Player Registration');
    expect(listItems[1].textContent).toBe('Game Statistics');
    expect(listItems[2].textContent).toBe('Tournament Information');
    expect(listItems[3].textContent).toBe('NFT Card Collection');
  });

  it('should have the correct component selector', () => {
    expect(component.constructor.name).toBe('LocalLandingPageComponent');
  });

  it('should have the landing-page container with proper class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const landingPageDiv = compiled.querySelector('.landing-page');
    expect(landingPageDiv).toBeTruthy();
  });

  it('should render module federation explanation text', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const explanationText = compiled.querySelector('.content p:nth-of-type(2)');
    expect(explanationText?.textContent?.trim()).toBe('In a full module federation setup, this would be loaded from the remote application.');
  });

  it('should have proper nested structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check that features div is inside content div
    const contentDiv = compiled.querySelector('.content');
    const featuresDiv = contentDiv?.querySelector('.features');
    expect(featuresDiv).toBeTruthy();
    
    // Check that ul is inside features div
    const featuresList = featuresDiv?.querySelector('ul');
    expect(featuresList).toBeTruthy();
  });

  it('should render description text correctly', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptionText = compiled.querySelector('.content p:first-of-type');
    expect(descriptionText?.textContent).toBe('This is the local version of the landing page component.');
  });
});
