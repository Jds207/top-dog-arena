import { Injectable, signal, computed, effect, Injector, inject } from '@angular/core';

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  gamertag: string;
  bio?: string;
  level: number;
  experience: number;
  rank: string;
  joinDate: string;
}

export interface AppSettings {
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
    email: boolean;
  };
  gameplay: {
    autoSave: boolean;
    difficulty: 'easy' | 'normal' | 'hard' | 'expert';
    soundEffects: boolean;
    music: boolean;
    volume: number;
  };
  display: {
    showAnimations: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    showTutorials: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly USER_PROFILE_KEY = 'tda-user-profile';
  private readonly APP_SETTINGS_KEY = 'tda-app-settings';

  // Default user profile
  private readonly defaultProfile: UserProfile = {
    name: 'New Player',
    email: '',
    gamertag: 'Player001',
    bio: '',
    level: 1,
    experience: 0,
    rank: 'Rookie',
    joinDate: new Date().toISOString()
  };

  // Default app settings
  private readonly defaultSettings: AppSettings = {
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      email: false
    },
    gameplay: {
      autoSave: true,
      difficulty: 'normal',
      soundEffects: true,
      music: true,
      volume: 75
    },
    display: {
      showAnimations: true,
      reducedMotion: false,
      fontSize: 'medium',
      showTutorials: true
    },
    privacy: {
      profileVisibility: 'friends',
      showOnlineStatus: true,
      allowFriendRequests: true
    }
  };

  // Signals
  private userProfile = signal<UserProfile>(this.loadUserProfile());
  private appSettings = signal<AppSettings>(this.loadAppSettings());

  // Computed properties
  readonly profile = computed(() => this.userProfile());
  readonly settings = computed(() => this.appSettings());
  readonly isProfileComplete = computed(() => {
    const profile = this.userProfile();
    return !!(profile.name && profile.email && profile.gamertag);
  });

  constructor() {
    // Auto-save changes
    effect(() => {
      this.saveUserProfile(this.userProfile());
    });

    effect(() => {
      this.saveAppSettings(this.appSettings());
    });
  }

  // User Profile Methods
  updateProfile(updates: Partial<UserProfile>): void {
    const current = this.userProfile();
    this.userProfile.set({ ...current, ...updates });
  }

  resetProfile(): void {
    this.userProfile.set({ ...this.defaultProfile });
  }

  // App Settings Methods
  updateSettings(updates: Partial<AppSettings>): void {
    const current = this.appSettings();
    this.appSettings.set({ ...current, ...updates });
  }

  updateNotificationSettings(updates: Partial<AppSettings['notifications']>): void {
    const current = this.appSettings();
    this.appSettings.set({
      ...current,
      notifications: { ...current.notifications, ...updates }
    });
  }

  updateGameplaySettings(updates: Partial<AppSettings['gameplay']>): void {
    const current = this.appSettings();
    this.appSettings.set({
      ...current,
      gameplay: { ...current.gameplay, ...updates }
    });
  }

  updateDisplaySettings(updates: Partial<AppSettings['display']>): void {
    const current = this.appSettings();
    this.appSettings.set({
      ...current,
      display: { ...current.display, ...updates }
    });
  }

  updatePrivacySettings(updates: Partial<AppSettings['privacy']>): void {
    const current = this.appSettings();
    this.appSettings.set({
      ...current,
      privacy: { ...current.privacy, ...updates }
    });
  }

  resetSettings(): void {
    this.appSettings.set({ ...this.defaultSettings });
  }

  // Level and Experience Methods
  addExperience(points: number): void {
    const current = this.userProfile();
    const newExp = current.experience + points;
    const newLevel = this.calculateLevel(newExp);
    const newRank = this.calculateRank(newLevel);

    this.userProfile.set({
      ...current,
      experience: newExp,
      level: newLevel,
      rank: newRank
    });
  }

  private calculateLevel(experience: number): number {
    // Simple level calculation: 1000 XP per level
    return Math.floor(experience / 1000) + 1;
  }

  private calculateRank(level: number): string {
    if (level >= 100) return 'Legend';
    if (level >= 75) return 'Master';
    if (level >= 50) return 'Expert';
    if (level >= 25) return 'Veteran';
    if (level >= 10) return 'Skilled';
    if (level >= 5) return 'Experienced';
    return 'Rookie';
  }

  // Storage Methods
  private loadUserProfile(): UserProfile {
    if (typeof window === 'undefined') {
      return { ...this.defaultProfile };
    }

    try {
      const stored = localStorage.getItem(this.USER_PROFILE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaultProfile, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load user profile:', error);
    }

    return { ...this.defaultProfile };
  }

  private loadAppSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return { ...this.defaultSettings };
    }

    try {
      const stored = localStorage.getItem(this.APP_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return this.mergeSettings(this.defaultSettings, parsed);
      }
    } catch (error) {
      console.warn('Failed to load app settings:', error);
    }

    return { ...this.defaultSettings };
  }

  private saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }

  private saveAppSettings(settings: AppSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save app settings:', error);
    }
  }

  private mergeSettings(defaults: AppSettings, stored: any): AppSettings {
    return {
      notifications: { ...defaults.notifications, ...stored.notifications },
      gameplay: { ...defaults.gameplay, ...stored.gameplay },
      display: { ...defaults.display, ...stored.display },
      privacy: { ...defaults.privacy, ...stored.privacy }
    };
  }

  // Export/Import Methods
  exportSettings(): string {
    return JSON.stringify({
      profile: this.userProfile(),
      settings: this.appSettings()
    }, null, 2);
  }

  importSettings(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.profile) {
        this.userProfile.set({ ...this.defaultProfile, ...parsed.profile });
      }
      
      if (parsed.settings) {
        this.appSettings.set(this.mergeSettings(this.defaultSettings, parsed.settings));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}
