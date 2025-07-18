import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ThemeSelectorComponent } from './theme-selector.component';
import { ThemeService } from '../services/theme.service';

describe('ThemeSelectorComponent', () => {
  let component: ThemeSelectorComponent;
  let fixture: ComponentFixture<ThemeSelectorComponent>;
  let themeService: jest.Mocked<ThemeService>;

  beforeEach(async () => {
    const mockThemeService = {
      setTheme: jest.fn(),
      cycleTheme: jest.fn(),
      resetTheme: jest.fn(),
      toggleDarkMode: jest.fn(),
      currentTheme: jest.fn().mockReturnValue('light'),
      themes: jest.fn().mockReturnValue([
        { id: 'light', name: 'Light', description: 'Clean and bright', icon: '☀️' },
        { id: 'dark', name: 'Dark', description: 'Dark and elegant', icon: '🌙' },
        { id: 'gaming', name: 'Gaming', description: 'High contrast gaming', icon: '🎮' },
        { id: 'arena', name: 'Arena', description: 'Battle-ready theme', icon: '⚔️' },
        { id: 'neon', name: 'Neon', description: 'Cyberpunk vibes', icon: '🌈' }
      ])
    };

    await TestBed.configureTestingModule({
      imports: [ThemeSelectorComponent],
      providers: [
        { provide: ThemeService, useValue: mockThemeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeSelectorComponent);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService) as jest.Mocked<ThemeService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render theme selector header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.theme-title')?.textContent).toContain('🎨 Choose Your Arena Theme');
    expect(compiled.querySelector('.theme-description')?.textContent).toContain('Customize your Top Dog Arena experience');
  });

  it('should display all available themes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeOptions = compiled.querySelectorAll('.theme-option');
    expect(themeOptions.length).toBe(5);
  });

  it('should render theme names and descriptions', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeNames = compiled.querySelectorAll('.theme-name');
    const expectedNames = ['Light', 'Dark', 'Gaming', 'Arena', 'Neon'];
    
    themeNames.forEach((nameElement, index) => {
      expect(nameElement.textContent).toBe(expectedNames[index]);
    });
  });

  it('should render theme icons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeIcons = compiled.querySelectorAll('.theme-icon');
    const expectedIcons = ['☀️', '🌙', '🎮', '⚔️', '🌈'];
    
    themeIcons.forEach((iconElement, index) => {
      expect(iconElement.textContent).toBe(expectedIcons[index]);
    });
  });

  it('should have color samples for each theme', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const colorSamples = compiled.querySelectorAll('.color-sample');
    // 3 color samples per theme * 5 themes = 15 total
    expect(colorSamples.length).toBe(15);
    
    // Check that each theme has primary, secondary, and accent color samples
    const themeOptions = compiled.querySelectorAll('.theme-option');
    themeOptions.forEach(themeOption => {
      const samples = themeOption.querySelectorAll('.color-sample');
      expect(samples.length).toBe(3);
      expect(samples[0].classList.contains('primary')).toBe(true);
      expect(samples[1].classList.contains('secondary')).toBe(true);
      expect(samples[2].classList.contains('accent')).toBe(true);
    });
  });

  it('should call selectTheme when theme option is clicked', () => {
    spyOn(component, 'selectTheme');
    const compiled = fixture.nativeElement as HTMLElement;
    const firstThemeOption = compiled.querySelector('.theme-option') as HTMLButtonElement;
    
    firstThemeOption.click();
    
    expect(component.selectTheme).toHaveBeenCalledWith('light');
  });

  it('should render theme action buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const actionButtons = compiled.querySelectorAll('.theme-actions button');
    expect(actionButtons.length).toBe(3);
    
    const toggleButton = compiled.querySelector('.btn-secondary');
    const cycleButton = compiled.querySelector('.btn-primary');
    const resetButton = compiled.querySelector('.btn-danger');
    
    expect(toggleButton?.textContent).toContain('Toggle Dark Mode');
    expect(cycleButton?.textContent).toContain('🔄 Cycle Themes');
    expect(resetButton?.textContent).toContain('🔄 Reset');
  });

  it('should call toggleDarkMode when toggle button is clicked', () => {
    spyOn(component, 'toggleDarkMode');
    const compiled = fixture.nativeElement as HTMLElement;
    const toggleButton = compiled.querySelector('.btn-secondary') as HTMLButtonElement;
    
    toggleButton.click();
    
    expect(component.toggleDarkMode).toHaveBeenCalled();
  });

  it('should call cycleTheme when cycle button is clicked', () => {
    spyOn(component, 'cycleTheme');
    const compiled = fixture.nativeElement as HTMLElement;
    const cycleButton = compiled.querySelector('.btn-primary') as HTMLButtonElement;
    
    cycleButton.click();
    
    expect(component.cycleTheme).toHaveBeenCalled();
  });

  it('should call resetTheme when reset button is clicked', () => {
    spyOn(component, 'resetTheme');
    const compiled = fixture.nativeElement as HTMLElement;
    const resetButton = compiled.querySelector('.btn-danger') as HTMLButtonElement;
    
    resetButton.click();
    
    expect(component.resetTheme).toHaveBeenCalled();
  });

  it('should have proper accessibility attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const themeButtons = compiled.querySelectorAll('.theme-option');
    
    themeButtons.forEach((button, index) => {
      const expectedLabels = [
        'Switch to Light theme',
        'Switch to Dark theme', 
        'Switch to Gaming theme',
        'Switch to Arena theme',
        'Switch to Neon theme'
      ];
      expect(button.getAttribute('aria-label')).toBe(expectedLabels[index]);
      expect(button.getAttribute('type')).toBe('button');
    });
  });

  it('should show active indicator for current theme', () => {
    // Mock the isActive method to return true for 'light' theme
    spyOn(component, 'isActive').and.callFake((themeId: string) => themeId === 'light');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const activeIndicators = compiled.querySelectorAll('.active-indicator');
    expect(activeIndicators.length).toBe(1);
    expect(activeIndicators[0].textContent?.trim()).toBe('✓ Active');
  });

  it('should apply active class to current theme', () => {
    spyOn(component, 'isActive').and.callFake((themeId: string) => themeId === 'light');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const themeOptions = compiled.querySelectorAll('.theme-option');
    expect(themeOptions[0].classList.contains('active')).toBe(true);
    expect(themeOptions[1].classList.contains('active')).toBe(false);
  });

  describe('Dark Mode Toggle', () => {
    it('should show moon icon when not in dark mode', () => {
      spyOn(component, 'isDarkMode').and.returnValue(false);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.btn-secondary');
      expect(toggleButton?.textContent).toContain('🌙');
    });

    it('should show sun icon when in dark mode', () => {
      spyOn(component, 'isDarkMode').and.returnValue(true);
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const toggleButton = compiled.querySelector('.btn-secondary');
      expect(toggleButton?.textContent).toContain('☀️');
    });
  });
});
