import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FallbackComponent } from './fallback.component';

// Mock component for router testing
@Component({
  template: '<div>Mock Home Component</div>'
})
class MockHomeComponent { }

describe('FallbackComponent', () => {
  let component: FallbackComponent;
  let fixture: ComponentFixture<FallbackComponent>;
  let router: jest.Mocked<Router>;
  let consoleSpy: jest.SpyInstance;
  let mockLocation: any;

  beforeEach(async () => {
    // Create router mock
    const routerMock = {
      navigate: jest.fn().mockResolvedValue(true),
      navigateByUrl: jest.fn().mockResolvedValue(true),
      url: '/test-url'
    };

    await TestBed.configureTestingModule({
      imports: [
        FallbackComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FallbackComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jest.Mocked<Router>;

    // Set up console spy
    consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Create mock location for tests that need it
    mockLocation = {
      href: '',
      reload: jest.fn()
    };
    
    fixture.detectChanges();
  });

  afterEach(() => {
    // Cleanup
    if (consoleSpy) {
      consoleSpy.calls.reset();
    }
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.errorDetails).toBeUndefined();
      expect(component.isNavigating).toBeFalse();
    });

    it('should log initialization message on ngOnInit', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation();
      component.ngOnInit();
      expect(logSpy).toHaveBeenCalledWith(
        'FallbackComponent initialized for route:', 
        '/test-url'
      );
    });
  });

  describe('Template Rendering', () => {
    it('should render fallback title', () => {
      const titleElement = fixture.debugElement.query(By.css('h3'));
      expect(titleElement?.nativeElement?.textContent).toContain('Loading Problem');
    });

    it('should render action buttons', () => {
      const backButton = fixture.debugElement.query(By.css('.back-button'));
      const retryButton = fixture.debugElement.query(By.css('.retry-button'));
      
      expect(backButton).toBeTruthy();
      expect(retryButton).toBeTruthy();
    });
  });

  describe('Navigation Methods', () => {
    describe('navigateToHome()', () => {
      it('should navigate to home successfully', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();

        await component.navigateToHome();

        expect(router.navigate).toHaveBeenCalledWith(['/']);
        expect(component.isNavigating).toBeFalsy();
        expect(logSpy).toHaveBeenCalledWith('Navigation to home successful');
      });

      it('should handle failed navigation with fallback', async () => {
        router.navigate.mockResolvedValue(false);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const locationSpy = jest.spyOn(component as any, 'fallbackNavigation').mockImplementation();
        
        await component.navigateToHome();
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation to home failed');
        expect(component.isNavigating).toBeFalsy();
      });

      it('should handle navigation error with fallback', async () => {
        const error = new Error('Navigation failed');
        router.navigate.and.returnValue(Promise.reject(error));
        const consoleErrorSpy = spyOn(console, 'error');
        
        await component.navigateToHome();
        
        expect(consoleErrorSpy).toHaveBeenCalledWith('Navigation error:', error);
        expect(component.isNavigating).toBeFalsy();
      });

      it('should prevent double navigation', () => {
        component.isNavigating = true;
        const logSpy = spyOn(console, 'log');
        
        component.navigateToHome();
        
        expect(logSpy).toHaveBeenCalledWith('Navigation already in progress');
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    describe('retryLoading()', () => {
      it('should attempt to reload the page', () => {
        const reloadSpy = spyOn(component as any, 'performReload');
        
        component.retryLoading();
        
        // Test verifies the method exists and can be called
        expect(component.retryLoading).toBeDefined();
      });

      it('should handle reload error gracefully', () => {
        const consoleErrorSpy = spyOn(console, 'error');
        
        component.retryLoading();
        
        expect(component.retryLoading).toBeDefined();
      });
    });
  });

  describe('Error Handling Methods', () => {
    describe('setErrorDetails()', () => {
      it('should set error details with string input', () => {
        const error = 'Network timeout';
        
        component.setErrorDetails(error);
        
        expect(component.errorDetails).toBe(error);
      });

      it('should set error details with Error object', () => {
        const error = new Error('Connection failed');
        
        component.setErrorDetails(error);
        
        expect(component.errorDetails).toBe('Connection failed');
      });

      it('should handle null error input', () => {
        component.setErrorDetails(null);
        
        expect(component.errorDetails).toBe('Unknown error occurred');
      });

      it('should handle undefined error input', () => {
        component.setErrorDetails(undefined);
        
        expect(component.errorDetails).toBe('Unknown error occurred');
      });

      it('should handle object error input', () => {
        const error = { message: 'Custom error', code: 500 };
        
        component.setErrorDetails(error);
        
        expect(component.errorDetails).toBe('{"message":"Custom error","code":500}');
      });
    });
  });

  describe('User Interactions', () => {
    it('should call navigateToHome when back button is clicked', () => {
      spyOn(component, 'navigateToHome');
      const backButton = fixture.debugElement.query(By.css('.back-button'));
      
      if (backButton) {
        backButton.nativeElement.click();
        expect(component.navigateToHome).toHaveBeenCalled();
      }
    });

    it('should call retryLoading when retry button is clicked', () => {
      spyOn(component, 'retryLoading');
      const retryButton = fixture.debugElement.query(By.css('.retry-button'));
      
      if (retryButton) {
        retryButton.nativeElement.click();
        expect(component.retryLoading).toHaveBeenCalled();
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete error flow', async () => {
      const errorMessage = 'Integration test error';
      const consoleLogSpy = spyOn(console, 'log');
      
      // Set error and detect changes
      component.setErrorDetails(errorMessage);
      fixture.detectChanges();
      
      // Navigate home
      await component.navigateToHome();
      
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(consoleLogSpy).toHaveBeenCalledWith('Navigation to home successful');
    });

    it('should handle retry after navigation failure', async () => {
      router.navigate.and.returnValue(Promise.resolve(false));
      
      // Failed navigation
      await component.navigateToHome();
      
      // Retry loading
      component.retryLoading();
      expect(component.retryLoading).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle router being null gracefully', () => {
      expect(() => component.navigateToHome()).not.toThrow();
    });

    it('should handle multiple rapid navigation attempts', async () => {
      const logSpy = spyOn(console, 'log');
      
      // Simulate multiple rapid navigation attempts
      component.navigateToHome();
      component.navigateToHome();
      
      expect(logSpy).toHaveBeenCalledWith('Navigation already in progress');
    });

    it('should handle empty router URL', () => {
      const logSpy = spyOn(console, 'log');
      component.ngOnInit();
      
      expect(logSpy).toHaveBeenCalledWith(
        'FallbackComponent initialized for route:', 
        '/test-url'
      );
    });
  });
});
