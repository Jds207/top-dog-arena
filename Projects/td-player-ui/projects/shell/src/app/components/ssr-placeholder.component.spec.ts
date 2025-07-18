import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SsrPlaceholderComponent } from './ssr-placeholder.component';
import { CommonModule } from '@angular/common';

describe('SsrPlaceholderComponent', () => {
  let component: SsrPlaceholderComponent;
  let fixture: ComponentFixture<SsrPlaceholderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SsrPlaceholderComponent, CommonModule]
    });
    fixture = TestBed.createComponent(SsrPlaceholderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the loading title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const h3Element = compiled.querySelector('h3');
    expect(h3Element?.textContent).toBe('Loading Player Landing Page...');
  });

  it('should render the loading message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const pElement = compiled.querySelector('p');
    expect(pElement?.textContent?.trim()).toBe('This content will be loaded when the page is fully rendered in the browser.');
  });

  it('should have placeholder container with proper class', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const placeholderDiv = compiled.querySelector('.placeholder');
    expect(placeholderDiv).toBeTruthy();
  });

  it('should have the correct component selector', () => {
    expect(component.constructor.name).toBe('SsrPlaceholderComponent');
  });

  it('should render both title and description in placeholder container', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const placeholderDiv = compiled.querySelector('.placeholder');
    
    const h3Element = placeholderDiv?.querySelector('h3');
    const pElement = placeholderDiv?.querySelector('p');
    
    expect(h3Element).toBeTruthy();
    expect(pElement).toBeTruthy();
    expect(h3Element?.textContent).toBe('Loading Player Landing Page...');
  });

  it('should have proper DOM structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Check that h3 and p are direct children of placeholder div
    const placeholderDiv = compiled.querySelector('.placeholder');
    const directChildren = placeholderDiv?.children;
    
    expect(directChildren?.length).toBe(2);
    expect(directChildren?.[0].tagName.toLowerCase()).toBe('h3');
    expect(directChildren?.[1].tagName.toLowerCase()).toBe('p');
  });
});
