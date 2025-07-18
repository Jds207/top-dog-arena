import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { CommonModule } from '@angular/common';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LandingPageComponent, CommonModule]
    });
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the landing page message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const pElement = compiled.querySelector('p');
    expect(pElement?.textContent).toBe('landing-page works!');
  });

  it('should have the correct component selector', () => {
    expect(component.constructor.name).toBe('LandingPageComponent');
  });

  it('should have a single paragraph element', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const paragraphs = compiled.querySelectorAll('p');
    expect(paragraphs.length).toBe(1);
  });

  it('should render content correctly after detection changes', () => {
    // After detectChanges, content should be rendered
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent?.trim()).toBe('landing-page works!');
  });
});
