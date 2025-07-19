import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ThemeService, type Theme } from '../services/theme.service';
import { SettingsService } from '../services/settings.service';
import { ThemeSelectorComponent } from './theme-selector.component';

type SettingsTab = 'profile' | 'appearance' | 'gameplay' | 'notifications' | 'privacy' | 'advanced';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeSelectorComponent],
  template: `
    <div class="settings-container">
      <div class="settings-header">
        <h2 class="settings-title">⚙️ Settings</h2>
        <p class="settings-subtitle">Customize your Top Dog Arena experience</p>
      </div>

      <!-- Settings Navigation Tabs -->
      <div class="settings-nav">
        <button
          *ngFor="let tab of settingsTabs"
          (click)="activeTab.set(tab.id)"
          [class.active]="activeTab() === tab.id"
          class="nav-tab"
          type="button"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Settings Content -->
      <div class="settings-content">
        
        <!-- Profile Settings -->
        <div *ngIf="activeTab() === 'profile'" class="settings-panel">
          <h3 class="panel-title">👤 Profile Settings</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="userName">Display Name</label>
              <input
                id="userName"
                type="text"
                [(ngModel)]="profile().name"
                (ngModelChange)="updateProfile({ name: $event })"
                class="form-input"
                placeholder="Enter your name"
              />
            </div>

            <div class="form-group">
              <label for="gamertag">Gamertag</label>
              <input
                id="gamertag"
                type="text"
                [(ngModel)]="profile().gamertag"
                (ngModelChange)="updateProfile({ gamertag: $event })"
                class="form-input"
                placeholder="Your unique gamertag"
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="profile().email"
                (ngModelChange)="updateProfile({ email: $event })"
                class="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div class="form-group full-width">
              <label for="bio">Bio</label>
              <textarea
                id="bio"
                [(ngModel)]="profile().bio"
                (ngModelChange)="updateProfile({ bio: $event })"
                class="form-textarea"
                placeholder="Tell us about yourself..."
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-card">
              <div class="stat-value">{{ profile().level }}</div>
              <div class="stat-label">Level</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ profile().experience.toLocaleString() }}</div>
              <div class="stat-label">Experience</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ profile().rank }}</div>
              <div class="stat-label">Rank</div>
            </div>
          </div>
        </div>

        <!-- Appearance Settings -->
        <div *ngIf="activeTab() === 'appearance'" class="settings-panel">
          <h3 class="panel-title">🎨 Appearance</h3>
          
          <!-- Theme Selector -->
          <app-theme-selector></app-theme-selector>

          <div class="form-grid mt-6">
            <div class="form-group">
              <label for="fontSize">Font Size</label>
              <select
                id="fontSize"
                [(ngModel)]="settings().display.fontSize"
                (ngModelChange)="updateDisplaySettings({ fontSize: $event })"
                class="form-select"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().display.showAnimations"
                  (ngModelChange)="updateDisplaySettings({ showAnimations: $event })"
                />
                <span>Enable Animations</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().display.reducedMotion"
                  (ngModelChange)="updateDisplaySettings({ reducedMotion: $event })"
                />
                <span>Reduce Motion</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().display.showTutorials"
                  (ngModelChange)="updateDisplaySettings({ showTutorials: $event })"
                />
                <span>Show Tutorials</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Gameplay Settings -->
        <div *ngIf="activeTab() === 'gameplay'" class="settings-panel">
          <h3 class="panel-title">🎮 Gameplay</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="difficulty">Difficulty</label>
              <select
                id="difficulty"
                [(ngModel)]="settings().gameplay.difficulty"
                (ngModelChange)="updateGameplaySettings({ difficulty: $event })"
                class="form-select"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div class="form-group">
              <label for="volume">Volume</label>
              <div class="volume-control">
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="100"
                  [(ngModel)]="settings().gameplay.volume"
                  (ngModelChange)="updateGameplaySettings({ volume: $event })"
                  class="form-range"
                />
                <span class="volume-value">{{ settings().gameplay.volume }}%</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().gameplay.autoSave"
                  (ngModelChange)="updateGameplaySettings({ autoSave: $event })"
                />
                <span>Auto Save</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().gameplay.soundEffects"
                  (ngModelChange)="updateGameplaySettings({ soundEffects: $event })"
                />
                <span>Sound Effects</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().gameplay.music"
                  (ngModelChange)="updateGameplaySettings({ music: $event })"
                />
                <span>Background Music</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Notifications Settings -->
        <div *ngIf="activeTab() === 'notifications'" class="settings-panel">
          <h3 class="panel-title">🔔 Notifications</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.enabled"
                  (ngModelChange)="updateNotificationSettings({ enabled: $event })"
                />
                <span>Enable Notifications</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.sound"
                  (ngModelChange)="updateNotificationSettings({ sound: $event })"
                  [disabled]="!settings().notifications.enabled"
                />
                <span>Sound Alerts</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.desktop"
                  (ngModelChange)="updateNotificationSettings({ desktop: $event })"
                  [disabled]="!settings().notifications.enabled"
                />
                <span>Desktop Notifications</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().notifications.email"
                  (ngModelChange)="updateNotificationSettings({ email: $event })"
                  [disabled]="!settings().notifications.enabled"
                />
                <span>Email Notifications</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div *ngIf="activeTab() === 'privacy'" class="settings-panel">
          <h3 class="panel-title">🔒 Privacy</h3>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="profileVisibility">Profile Visibility</label>
              <select
                id="profileVisibility"
                [(ngModel)]="settings().privacy.profileVisibility"
                (ngModelChange)="updatePrivacySettings({ profileVisibility: $event })"
                class="form-select"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().privacy.showOnlineStatus"
                  (ngModelChange)="updatePrivacySettings({ showOnlineStatus: $event })"
                />
                <span>Show Online Status</span>
              </label>
            </div>

            <div class="form-group">
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  [(ngModel)]="settings().privacy.allowFriendRequests"
                  (ngModelChange)="updatePrivacySettings({ allowFriendRequests: $event })"
                />
                <span>Allow Friend Requests</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Advanced Settings -->
        <div *ngIf="activeTab() === 'advanced'" class="settings-panel">
          <h3 class="panel-title">⚙️ Advanced</h3>
          
          <div class="advanced-actions">
            <div class="action-group">
              <h4>Data Management</h4>
              <div class="action-buttons">
                <button (click)="exportSettings()" class="btn-secondary">
                  📤 Export Settings
                </button>
                <label for="importFile" class="btn-secondary file-input-label">
                  📥 Import Settings
                  <input
                    id="importFile"
                    type="file"
                    accept=".json"
                    (change)="importSettings($event)"
                    class="file-input"
                  />
                </label>
              </div>
            </div>

            <div class="action-group">
              <h4>Reset Options</h4>
              <div class="action-buttons">
                <button (click)="resetProfile()" class="btn-error">
                  🔄 Reset Profile
                </button>
                <button (click)="resetAllSettings()" class="btn-error">
                  ⚠️ Reset All Settings
                </button>
              </div>
            </div>

            <div class="action-group">
              <h4>Debug Information</h4>
              <div class="debug-info">
                <p><strong>Profile Complete:</strong> {{ isProfileComplete() ? 'Yes' : 'No' }}</p>
                <p><strong>Theme:</strong> {{ currentTheme() }}</p>
                <p><strong>Join Date:</strong> {{ formatDate(profile().joinDate) }}</p>
                <p><strong>Settings Version:</strong> 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .settings-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .settings-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
    }

    .settings-subtitle {
      color: rgb(var(--color-text-secondary));
      font-size: 1.125rem;
    }

    .settings-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgb(var(--color-border));
      padding-bottom: 1rem;
    }

    .nav-tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border: none;
      background: transparent;
      border-radius: 0.5rem;
      color: rgb(var(--color-text-secondary));
      cursor: pointer;
      transition: all 200ms;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .nav-tab:hover {
      background-color: rgb(var(--color-bg-secondary));
      color: rgb(var(--color-text-primary));
    }

    .nav-tab.active {
      background-color: #f97316;
      color: white;
    }

    .tab-icon {
      font-size: 1rem;
    }

    .settings-content {
      background-color: rgb(var(--color-bg-secondary));
      border-radius: 1rem;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .settings-panel {
      animation: fadeIn 300ms ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .panel-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label:not(.form-checkbox) {
      font-weight: 500;
      color: rgb(var(--color-text-primary));
      font-size: 0.875rem;
    }

    .form-input, .form-select, .form-textarea {
      padding: 0.75rem;
      border: 1px solid rgb(var(--color-border));
      border-radius: 0.5rem;
      background-color: rgb(var(--color-bg-primary));
      color: rgb(var(--color-text-primary));
      font-size: 0.875rem;
      transition: border-color 200ms;
    }

    .form-input:focus, .form-select:focus, .form-textarea:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.2);
    }

    .form-checkbox {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      font-size: 0.875rem;
      color: rgb(var(--color-text-primary));
    }

    .form-checkbox input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      accent-color: #f97316;
    }

    .form-range {
      width: 100%;
      height: 0.5rem;
      background: rgb(var(--color-border));
      border-radius: 0.25rem;
      outline: none;
      accent-color: #f97316;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .volume-value {
      font-weight: 500;
      color: rgb(var(--color-text-primary));
      min-width: 3rem;
    }

    .profile-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid rgb(var(--color-border));
    }

    .stat-card {
      text-align: center;
      padding: 1rem;
      background-color: rgb(var(--color-bg-primary));
      border-radius: 0.5rem;
      border: 1px solid rgb(var(--color-border));
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #f97316;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.75rem;
      color: rgb(var(--color-text-secondary));
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .advanced-actions {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .action-group h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1rem;
    }

    .action-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .btn-secondary, .btn-error, .file-input-label {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 200ms;
      border: none;
      font-size: 0.875rem;
    }

    .btn-secondary {
      background-color: #64748b;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #475569;
    }

    .btn-error {
      background-color: #ef4444;
      color: white;
    }

    .btn-error:hover {
      background-color: #dc2626;
    }

    .file-input-label {
      display: inline-block;
      background-color: #64748b;
      color: white;
      position: relative;
    }

    .file-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .debug-info {
      background-color: rgb(var(--color-bg-primary));
      border: 1px solid rgb(var(--color-border));
      border-radius: 0.5rem;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.875rem;
    }

    .debug-info p {
      margin: 0.5rem 0;
      color: rgb(var(--color-text-secondary));
    }

    .mt-6 {
      margin-top: 1.5rem;
    }

    @media (max-width: 768px) {
      .settings-container {
        padding: 1rem;
      }

      .settings-nav {
        justify-content: center;
      }

      .nav-tab {
        flex: 1;
        justify-content: center;
        min-width: 100px;
      }

      .tab-label {
        display: none;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .profile-stats {
        grid-template-columns: repeat(3, 1fr);
      }

      .action-buttons {
        flex-direction: column;
      }

      .btn-secondary, .btn-error, .file-input-label {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  // Tab management
  readonly activeTab = signal<SettingsTab>('profile');

  // Service data
  readonly profile = computed(() => this.settingsService.profile());
  readonly settings = computed(() => this.settingsService.settings());
  readonly isProfileComplete = computed(() => this.settingsService.isProfileComplete());
  readonly currentTheme = computed(() => this.themeService.theme());

  readonly settingsTabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: '👤' },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: '🎨' },
    { id: 'gameplay' as SettingsTab, label: 'Gameplay', icon: '🎮' },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: '🔔' },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: '🔒' },
    { id: 'advanced' as SettingsTab, label: 'Advanced', icon: '⚙️' }
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly settingsService: SettingsService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('Settings - Customize Your Experience | Top Dog Arena');
  }

  // Profile methods
  updateProfile(updates: any): void {
    this.settingsService.updateProfile(updates);
  }

  resetProfile(): void {
    if (confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
      this.settingsService.resetProfile();
    }
  }

  // Settings methods
  updateNotificationSettings(updates: any): void {
    this.settingsService.updateNotificationSettings(updates);
  }

  updateGameplaySettings(updates: any): void {
    this.settingsService.updateGameplaySettings(updates);
  }

  updateDisplaySettings(updates: any): void {
    this.settingsService.updateDisplaySettings(updates);
  }

  updatePrivacySettings(updates: any): void {
    this.settingsService.updatePrivacySettings(updates);
  }

  resetAllSettings(): void {
    if (confirm('Are you sure you want to reset ALL settings? This will reset your profile and all preferences.')) {
      this.settingsService.resetSettings();
      this.settingsService.resetProfile();
      this.themeService.resetTheme();
    }
  }

  // Import/Export methods
  exportSettings(): void {
    const data = this.settingsService.exportSettings();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `tda-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  importSettings(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = this.settingsService.importSettings(data);
        
        if (success) {
          alert('Settings imported successfully!');
        } else {
          alert('Failed to import settings. Please check the file format.');
        }
      } catch (error) {
        alert('Error reading file. Please try again.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
