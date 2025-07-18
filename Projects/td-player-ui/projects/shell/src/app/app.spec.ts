import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    const mockActivatedRoute = {
      snapshot: { params: {} },
      params: { subscribe: () => {} },
      queryParams: { subscribe: () => {} }
    };

    await TestBed.configureTestingModule({
      imports: [App, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Top Dog Arena');
  });
});
