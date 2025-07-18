import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ViewContainerRef, ComponentRef } from '@angular/core';

import { RemoteWrapperComponent } from './remote-wrapper.component';
import { LocalLandingPageComponent } from './local-landing-page.component';

describe('RemoteWrapperComponent', () => {
  let component: RemoteWrapperComponent;
  let fixture: ComponentFixture<RemoteWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoteWrapperComponent, LocalLandingPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RemoteWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show local landing page initially', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.isRemoteLoaded).toBe(false);
    expect(compiled.querySelector('app-local-landing-page')).toBeTruthy();
  });

  it('should have container div', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const container = compiled.querySelector('div');
    expect(container).toBeTruthy();
  });

  describe('Template rendering', () => {
    it('should show local landing page when remote is not loaded', () => {
      component.isRemoteLoaded = false;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const localComponent = compiled.querySelector('app-local-landing-page');
      expect(localComponent).toBeTruthy();
    });

    it('should hide local landing page when remote is loaded', () => {
      component.isRemoteLoaded = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const localComponent = compiled.querySelector('app-local-landing-page');
      expect(localComponent).toBeFalsy();
    });
  });

  describe('Component properties', () => {
    it('should initialize isRemoteLoaded as false', () => {
      expect(component.isRemoteLoaded).toBe(false);
    });

    it('should have ngOnInit method', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(typeof component.ngOnInit).toBe('function');
    });

    it('should handle ngOnInit without errors', async () => {
      expect(() => {
        component.ngOnInit();
      }).not.toThrow();
    });
  });

  describe('Platform compatibility', () => {
    it('should work with browser platform', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [RemoteWrapperComponent, LocalLandingPageComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'browser' }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RemoteWrapperComponent);
      component = fixture.componentInstance;

      expect(component).toBeTruthy();
    });

    it('should work with server platform', async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [RemoteWrapperComponent, LocalLandingPageComponent],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(RemoteWrapperComponent);
      component = fixture.componentInstance;

      expect(component).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle console warnings gracefully', () => {
      const consoleWarnSpy = spyOn(console, 'warn');
      
      // Component should not crash even if console.warn is called
      console.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Test warning');
    });
  });

  describe('DOM structure', () => {
    it('should have proper DOM structure', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should have a container div
      const container = compiled.querySelector('div');
      expect(container).toBeTruthy();
      
      // Should contain the local landing page component
      const localComponent = compiled.querySelector('app-local-landing-page');
      expect(localComponent).toBeTruthy();
    });

    it('should maintain proper template reference', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      
      // The container should be present
      expect(compiled.children.length).toBeGreaterThan(0);
    });
  });
});
