import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, NFTStatsResponse, WalletInfoResponse, DetailedHealthResponse } from '../services/api.service';

@Component({
  selector: 'app-nft-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-dashboard">
      <header class="page-header">
        <h1>📈 NFT Analytics Dashboard</h1>
        <div class="header-controls">
          <button (click)="router.navigate(['/admin'])" class="back-btn">← Back to Admin</button>
          <button (click)="refreshData()" class="refresh-btn" [disabled]="loading">
            <span class="animate-spin" *ngIf="loading">⟳</span>
            <span *ngIf="!loading">🔄</span>
            Refresh Data
          </button>
        </div>
      </header>

      <!-- Key Metrics Overview -->
      <div class="metrics-overview" *ngIf="analytics">
        <div class="metric-card primary">
          <div class="metric-icon">🎴</div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics.overview.totalNFTs }}</div>
            <div class="metric-label">Total NFTs Minted</div>
            <div class="metric-change positive" *ngIf="analytics.growth.recentMints > 0">
              +{{ analytics.growth.recentMints }} recent
            </div>
          </div>
        </div>

        <div class="metric-card success">
          <div class="metric-icon">✅</div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics.overview.activeNFTs }}</div>
            <div class="metric-label">Active NFTs</div>
            <div class="metric-percentage">
              {{ getActivePercentage() }}% of total
            </div>
          </div>
        </div>

        <div class="metric-card warning" *ngIf="analytics.overview.burnedNFTs > 0">
          <div class="metric-icon">🔥</div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics.overview.burnedNFTs }}</div>
            <div class="metric-label">Burned NFTs</div>
            <div class="metric-percentage">
              {{ analytics.overview.burnRate }}% burn rate
            </div>
          </div>
        </div>

        <div class="metric-card info">
          <div class="metric-icon">👥</div>
          <div class="metric-content">
            <div class="metric-value">{{ analytics.growth.totalAccounts }}</div>
            <div class="metric-label">Unique Holders</div>
            <div class="metric-ratio">
              {{ analytics.growth.avgNFTsPerAccount }} NFTs/holder
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Visualizations -->
      <div class="charts-section" *ngIf="analytics">
        <div class="chart-container">
          <h2>Collection Health</h2>
          <div class="health-chart">
            <div class="health-bar">
              <div class="health-segment active" 
                   [style.width.%]="getActivePercentage()">
                <span class="segment-label">Active ({{ getActivePercentage() }}%)</span>
              </div>
              <div class="health-segment burned" 
                   [style.width.%]="getBurnedPercentage()"
                   *ngIf="getBurnedPercentage() > 0">
                <span class="segment-label">Burned ({{ getBurnedPercentage() }}%)</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color active"></div>
                <span>Active NFTs: {{ analytics.overview.activeNFTs }}</span>
              </div>
              <div class="legend-item" *ngIf="analytics.overview.burnedNFTs > 0">
                <div class="legend-color burned"></div>
                <span>Burned NFTs: {{ analytics.overview.burnedNFTs }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="chart-container">
          <h2>Distribution Analysis</h2>
          <div class="distribution-stats">
            <div class="stat-row">
              <span class="stat-label">Total Collection Size:</span>
              <span class="stat-value">{{ analytics.overview.totalNFTs }} NFTs</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Unique Holders:</span>
              <span class="stat-value">{{ analytics.growth.totalAccounts }} accounts</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average per Holder:</span>
              <span class="stat-value">{{ analytics.growth.avgNFTsPerAccount }} NFTs</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Distribution Ratio:</span>
              <span class="stat-value">{{ getDistributionRatio() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Network & System Status -->
      <div class="system-section" *ngIf="systemHealth && walletInfo">
        <h2>System Status</h2>
        <div class="system-grid">
          <div class="system-card" [class]="getSystemStatusClass('api')">
            <div class="system-header">
              <span class="system-icon">🖥️</span>
              <h3>API Service</h3>
            </div>
            <div class="system-status">{{ systemHealth.services.api | titlecase }}</div>
            <div class="system-meta">
              <div>Version: {{ systemHealth.version }}</div>
              <div>Environment: {{ systemHealth.environment | titlecase }}</div>
              <div>Timestamp: {{ systemHealth.timestamp | date:'short' }}</div>
            </div>
          </div>

          <div class="system-card" [class]="getSystemStatusClass('xrpl')">
            <div class="system-header">
              <span class="system-icon">🔗</span>
              <h3>XRPL Network</h3>
            </div>
            <div class="system-status">{{ systemHealth.services.xrpl | titlecase }}</div>
            <div class="system-meta">
              <div>Network: {{ systemHealth.services.xrpl | titlecase }}</div>
              <div>Wallet: Connected</div>
              <div>Balance: {{ getWalletBalance() }} XRP</div>
            </div>
          </div>

          <div class="system-card" [class]="getSystemStatusClass('database')">
            <div class="system-header">
              <span class="system-icon">🗃️</span>
              <h3>Database</h3>
            </div>
            <div class="system-status">{{ systemHealth.services.database | titlecase }}</div>
            <div class="system-meta">
              <div>Status: {{ systemHealth.services.database | titlecase }}</div>
              <div>Storage: API Database</div>
              <div>Records: {{ analytics?.overview.totalNFTs || 0 }} NFTs</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section" *ngIf="analytics">
        <h2>Collection Insights</h2>
        <div class="insights-grid">
          <div class="insight-card">
            <div class="insight-icon">🚀</div>
            <div class="insight-content">
              <h3>Growth Rate</h3>
              <div class="insight-value">{{ analytics.growth.recentMints || 0 }}</div>
              <div class="insight-description">Recent mints in the collection</div>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">🎯</div>
            <div class="insight-content">
              <h3>Retention Rate</h3>
              <div class="insight-value">{{ getRetentionRate() }}%</div>
              <div class="insight-description">NFTs still active (not burned)</div>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">📊</div>
            <div class="insight-content">
              <h3>Collection Health</h3>
              <div class="insight-value">{{ getHealthScore() }}</div>
              <div class="insight-description">Overall collection health score</div>
            </div>
          </div>

          <div class="insight-card">
            <div class="insight-icon">💎</div>
            <div class="insight-content">
              <h3>Rarity Index</h3>
              <div class="insight-value">{{ getRarityIndex() }}</div>
              <div class="insight-description">Based on distribution patterns</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-overlay" *ngIf="loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <div class="loading-text">{{ loadingMessage }}</div>
        </div>
      </div>

      <!-- Error Messages -->
      <div class="error-message" *ngIf="errorMessage">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
        <button (click)="clearError()" class="error-close">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .analytics-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid rgba(249, 115, 22, 0.2);
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin: 0;
    }

    .header-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .back-btn, .refresh-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
    }

    .back-btn {
      background: rgba(var(--color-bg-tertiary), 0.8);
      color: rgb(var(--color-text-secondary));
    }

    .back-btn:hover {
      background: rgba(var(--color-bg-tertiary), 1);
      transform: translateY(-1px);
    }

    .refresh-btn {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
    }

    .refresh-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Metrics Overview */
    .metrics-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      border-radius: 1rem;
      border: 2px solid;
      transition: all 0.3s ease;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .metric-card.primary {
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1));
      border-color: rgba(249, 115, 22, 0.3);
      color: rgb(249, 115, 22);
    }

    .metric-card.success {
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
      border-color: rgba(34, 197, 94, 0.3);
      color: rgb(34, 197, 94);
    }

    .metric-card.warning {
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
      border-color: rgba(251, 191, 36, 0.3);
      color: rgb(251, 191, 36);
    }

    .metric-card.info {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
      border-color: rgba(59, 130, 246, 0.3);
      color: rgb(59, 130, 246);
    }

    .metric-icon {
      font-size: 3rem;
      opacity: 0.8;
    }

    .metric-value {
      font-size: 2.5rem;
      font-weight: bold;
      line-height: 1;
      color: rgb(var(--color-text-primary));
    }

    .metric-label {
      font-size: 1rem;
      font-weight: 600;
      color: rgb(var(--color-text-secondary));
      margin-bottom: 0.25rem;
    }

    .metric-change, .metric-percentage, .metric-ratio {
      font-size: 0.875rem;
      font-weight: 500;
      opacity: 0.8;
    }

    .metric-change.positive {
      color: rgb(34, 197, 94);
    }

    /* Charts Section */
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .chart-container {
      background: rgba(var(--color-bg-secondary), 0.8);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      padding: 2rem;
    }

    .chart-container h2 {
      font-size: 1.5rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .health-chart {
      margin-bottom: 1rem;
    }

    .health-bar {
      display: flex;
      height: 60px;
      border-radius: 2rem;
      overflow: hidden;
      background: rgba(var(--color-bg-tertiary), 0.3);
      border: 2px solid rgba(var(--color-bg-tertiary), 0.5);
    }

    .health-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;
    }

    .health-segment.active {
      background: linear-gradient(135deg, #22c55e, #16a34a);
    }

    .health-segment.burned {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .segment-label {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    .chart-legend {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legend-color {
      width: 1rem;
      height: 1rem;
      border-radius: 0.25rem;
    }

    .legend-color.active {
      background: linear-gradient(135deg, #22c55e, #16a34a);
    }

    .legend-color.burned {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .distribution-stats {
      space-y: 1rem;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(var(--color-bg-tertiary), 0.3);
    }

    .stat-row:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-weight: 500;
      color: rgb(var(--color-text-secondary));
    }

    .stat-value {
      font-weight: bold;
      color: rgb(var(--color-text-primary));
    }

    /* System Section */
    .system-section {
      margin-bottom: 2rem;
    }

    .system-section h2 {
      font-size: 1.875rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .system-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .system-card {
      padding: 1.5rem;
      border-radius: 1rem;
      border: 2px solid;
      transition: all 0.3s ease;
    }

    .system-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .system-card.healthy {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
    }

    .system-card.connected {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
    }

    .system-card.error, .system-card.disconnected {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }

    .system-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .system-icon {
      font-size: 2rem;
    }

    .system-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
    }

    .system-status {
      font-size: 1.125rem;
      font-weight: bold;
      margin-bottom: 0.75rem;
      color: rgb(var(--color-text-primary));
    }

    .system-meta {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      line-height: 1.5;
    }

    /* Activity Section */
    .activity-section h2 {
      font-size: 1.875rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .insight-card {
      background: rgba(var(--color-bg-secondary), 0.8);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .insight-card:hover {
      border-color: rgba(249, 115, 22, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .insight-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      opacity: 0.8;
    }

    .insight-content h3 {
      font-size: 1rem;
      font-weight: 600;
      color: rgb(var(--color-text-secondary));
      margin-bottom: 0.5rem;
    }

    .insight-value {
      font-size: 1.875rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
    }

    .insight-description {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      line-height: 1.4;
    }

    /* Loading */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .loading-spinner {
      background: rgba(var(--color-bg-primary), 0.95);
      padding: 2rem;
      border-radius: 1rem;
      text-align: center;
      border: 2px solid rgba(249, 115, 22, 0.2);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(249, 115, 22, 0.3);
      border-top: 4px solid #f97316;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      color: rgb(var(--color-text-primary));
      font-weight: 500;
    }

    /* Error Message */
    .error-message {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: rgba(239, 68, 68, 0.9);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      z-index: 1001;
      max-width: 400px;
    }

    .error-close {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.125rem;
      margin-left: 0.5rem;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .analytics-dashboard {
        padding: 1rem;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-controls {
        width: 100%;
        justify-content: space-between;
      }

      .metrics-overview {
        grid-template-columns: 1fr;
      }

      .charts-section {
        grid-template-columns: 1fr;
      }

      .system-grid {
        grid-template-columns: 1fr;
      }

      .insights-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .metric-card {
        padding: 1.5rem;
      }

      .metric-icon {
        font-size: 2rem;
      }

      .metric-value {
        font-size: 2rem;
      }
    }
  `]
})
export class NftAnalyticsComponent implements OnInit {
  // Data
  systemHealth: DetailedHealthResponse | null = null;
  walletInfo: WalletInfoResponse | null = null;
  nftStats: NFTStatsResponse | null = null;
  analytics: any = null;

  // UI state
  loading = false;
  loadingMessage = '';
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    public router: Router
  ) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.loading = true;
    this.loadingMessage = 'Loading analytics data...';

    // Load all data in parallel
    Promise.all([
      this.loadSystemHealth(),
      this.loadWalletInfo(),
      this.loadNFTStats()
    ]).then(() => {
      this.loading = false;
    }).catch((error) => {
      this.handleError('Failed to load analytics data', error);
      this.loading = false;
    });
  }

  private loadSystemHealth(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getDetailedHealth().subscribe({
        next: (health: DetailedHealthResponse) => {
          this.systemHealth = health;
          resolve();
        },
        error: (error: any) => reject(error)
      });
    });
  }

  private loadWalletInfo(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getWalletInfo().subscribe({
        next: (wallet: WalletInfoResponse) => {
          this.walletInfo = wallet;
          resolve();
        },
        error: (error: any) => reject(error)
      });
    });
  }

  private loadNFTStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.apiService.getNFTStatistics().subscribe({
        next: (stats: NFTStatsResponse) => {
          this.nftStats = stats;
          this.analytics = this.calculateCollectionAnalytics(stats.data);
          resolve();
        },
        error: (error: any) => reject(error)
      });
    });
  }

  // Calculation methods
  getActivePercentage(): number {
    if (!this.analytics) return 0;
    const total = this.analytics.overview.totalNFTs;
    if (total === 0) return 0;
    return Math.round((this.analytics.overview.activeNFTs / total) * 100);
  }

  getBurnedPercentage(): number {
    if (!this.analytics) return 0;
    const total = this.analytics.overview.totalNFTs;
    if (total === 0) return 0;
    return Math.round((this.analytics.overview.burnedNFTs / total) * 100);
  }

  getDistributionRatio(): string {
    if (!this.analytics) return 'N/A';
    const totalNFTs = this.analytics.overview.totalNFTs;
    const totalAccounts = this.analytics.growth.totalAccounts;
    
    if (totalAccounts === 0) return 'No holders';
    if (totalAccounts === 1) return 'Single holder';
    if (totalNFTs === totalAccounts) return '1:1 Perfect distribution';
    if (totalNFTs > totalAccounts * 2) return 'Concentrated';
    return 'Well distributed';
  }

  getRetentionRate(): number {
    if (!this.analytics) return 0;
    const total = this.analytics.overview.totalNFTs;
    if (total === 0) return 0;
    return Math.round((this.analytics.overview.activeNFTs / total) * 100);
  }

  getHealthScore(): string {
    if (!this.analytics) return 'N/A';
    
    const retentionRate = this.getRetentionRate();
    const avgPerAccount = parseFloat(this.analytics.growth.avgNFTsPerAccount);
    const totalNFTs = this.analytics.overview.totalNFTs;
    
    let score = 0;
    
    // Retention rate score (50% weight)
    if (retentionRate >= 95) score += 50;
    else if (retentionRate >= 90) score += 40;
    else if (retentionRate >= 80) score += 30;
    else if (retentionRate >= 70) score += 20;
    else score += 10;
    
    // Distribution score (30% weight)
    if (avgPerAccount >= 1 && avgPerAccount <= 5) score += 30;
    else if (avgPerAccount <= 10) score += 20;
    else score += 10;
    
    // Collection size score (20% weight)
    if (totalNFTs >= 100) score += 20;
    else if (totalNFTs >= 50) score += 15;
    else if (totalNFTs >= 10) score += 10;
    else score += 5;
    
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  getRarityIndex(): string {
    if (!this.analytics) return 'N/A';
    
    const totalNFTs = this.analytics.overview.totalNFTs;
    const totalAccounts = this.analytics.growth.totalAccounts;
    
    if (totalNFTs === 0) return 'No collection';
    if (totalNFTs <= 10) return 'Ultra Rare';
    if (totalNFTs <= 50) return 'Rare';
    if (totalNFTs <= 100) return 'Limited';
    if (totalNFTs <= 500) return 'Collectible';
    if (totalNFTs <= 1000) return 'Common';
    return 'Mass Market';
  }

  getSystemStatusClass(service: string): string {
    if (!this.systemHealth) return '';
    const status = this.systemHealth.services[service as keyof typeof this.systemHealth.services];
    return status || '';
  }

  getWalletBalance(): string {
    if (!this.walletInfo || !this.walletInfo.data.balance) {
      return 'N/A';
    }
    return this.walletInfo.data.balance.balance;
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.showError(message + ': ' + (error.error?.message || error.message || 'Unknown error'));
  }

  private showError(message: string) {
    this.errorMessage = message;
    setTimeout(() => this.clearError(), 5000);
  }

  clearError() {
    this.errorMessage = '';
  }

  private calculateCollectionAnalytics(statsData: any): any {
    // Create analytics based on the NFT statistics from port 3000
    const totalNFTs = statsData.totalNFTs || 0;
    const totalAccounts = statsData.totalAccounts || 0;
    const avgNFTsPerAccount = totalAccounts > 0 ? (totalNFTs / totalAccounts).toFixed(2) : '0';
    
    return {
      overview: {
        totalNFTs: totalNFTs,
        activeNFTs: totalNFTs, // Assuming all are active for now
        burnedNFTs: 0, // No burned NFTs data in current API
        totalValue: 0, // No value data in current API
        burnRate: 0 // No burn rate data in current API
      },
      growth: {
        recentMints: 0, // No recent mints data in current API
        growthRate: 0,
        previousPeriod: 0,
        totalAccounts: totalAccounts,
        avgNFTsPerAccount: avgNFTsPerAccount
      },
      health: {
        score: totalNFTs > 0 ? 85 : 0, // Simple health score
        status: totalNFTs > 0 ? 'healthy' : 'needs_attention',
        issues: []
      },
      retention: {
        activeHolders: totalAccounts,
        retentionRate: 75, // Placeholder
        avgHoldingTime: '45 days' // Placeholder
      },
      categories: {
        // Placeholder category data since it's not in the current API
        baseball_cards: 60,
        rare_items: 25,
        special_editions: 15
      },
      rarity: {
        // Placeholder rarity data since it's not in the current API
        common: 70,
        uncommon: 20,
        rare: 8,
        legendary: 2
      }
    };
  }
}
