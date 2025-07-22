import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataApiService, NFTDetailsResponse, AccountNFTsResponse, NFTStatsResponse, WalletInfoResponse, DetailedHealthResponse } from '../services/data-api.service';

@Component({
  selector: 'app-data-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="data-explorer">
      <header class="page-header">
        <h1>📊 Data Explorer</h1>
        <div class="header-controls">
          <button (click)="router.navigate(['/admin'])" class="back-btn">← Back to Admin</button>
          <button (click)="refreshSystemStatus()" class="refresh-btn" [disabled]="loading">
            <span class="animate-spin" *ngIf="loading">⟳</span>
            <span *ngIf="!loading">🔄</span>
            Refresh Status
          </button>
        </div>
      </header>

      <!-- System Status Dashboard -->
      <div class="status-grid" *ngIf="systemHealth">
        <div class="status-card" [ngClass]="getStatusClass(systemHealth.data.services.api)">
          <div class="status-header">
            <span class="status-icon">🖥️</span>
            <h3>API Status</h3>
          </div>
          <div class="status-value">{{ systemHealth.data.services.api | titlecase }}</div>
          <div class="status-meta">Version {{ systemHealth.data.version }}</div>
        </div>

        <div class="status-card" [ngClass]="getStatusClass(systemHealth.data.services.xrpl)">
          <div class="status-header">
            <span class="status-icon">🔗</span>
            <h3>XRPL Network</h3>
          </div>
          <div class="status-value">{{ systemHealth.data.services.xrpl | titlecase }}</div>
          <div class="status-meta">{{ systemHealth.data.xrpl.network | titlecase }}</div>
        </div>

        <div class="status-card" [ngClass]="getStatusClass(systemHealth.data.services.database)">
          <div class="status-header">
            <span class="status-icon">🗃️</span>
            <h3>Database</h3>
          </div>
          <div class="status-value">{{ systemHealth.data.services.database | titlecase }}</div>
          <div class="status-meta">{{ systemHealth.data.database.responseTime }}ms</div>
        </div>

        <div class="status-card" *ngIf="walletInfo">
          <div class="status-header">
            <span class="status-icon">💰</span>
            <h3>Wallet Balance</h3>
          </div>
          <div class="status-value">{{ walletInfo.data.balance.xrp }} XRP</div>
          <div class="status-meta">{{ walletInfo.data.network.walletAddress.substring(0, 10) }}...</div>
        </div>
      </div>

      <!-- NFT Statistics -->
      <div class="stats-section" *ngIf="nftStats">
        <h2>📈 Collection Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card total">
            <div class="stat-icon">🎴</div>
            <div class="stat-content">
              <div class="stat-value">{{ nftStats.data.totalNFTs }}</div>
              <div class="stat-label">Total NFTs</div>
            </div>
          </div>

          <div class="stat-card active">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-value">{{ nftStats.data.activeNFTs }}</div>
              <div class="stat-label">Active NFTs</div>
            </div>
          </div>

          <div class="stat-card burned">
            <div class="stat-icon">🔥</div>
            <div class="stat-content">
              <div class="stat-value">{{ nftStats.data.burnedNFTs }}</div>
              <div class="stat-label">Burned NFTs</div>
            </div>
          </div>

          <div class="stat-card accounts">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <div class="stat-value">{{ nftStats.data.totalAccounts }}</div>
              <div class="stat-label">Total Accounts</div>
            </div>
          </div>

          <div class="stat-card recent">
            <div class="stat-icon">🆕</div>
            <div class="stat-content">
              <div class="stat-value">{{ nftStats.data.recentMints }}</div>
              <div class="stat-label">Recent Mints</div>
            </div>
          </div>

          <div class="stat-card rate" *ngIf="collectionAnalytics">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-value">{{ collectionAnalytics.overview.burnRate }}%</div>
              <div class="stat-label">Burn Rate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Query Tools -->
      <div class="query-section">
        <h2>🔍 Data Query Tools</h2>
        
        <div class="query-tabs">
          <button 
            *ngFor="let tab of queryTabs" 
            (click)="activeTab = tab.id"
            [class]="'tab-btn ' + (activeTab === tab.id ? 'active' : '')">
            <span [innerHTML]="tab.icon"></span>
            {{ tab.label }}
          </button>
        </div>

        <!-- NFT Lookup Tab -->
        <div class="query-panel" *ngIf="activeTab === 'nft-lookup'">
          <div class="form-group">
            <label for="nftId">NFT ID (64-character hex)</label>
            <div class="input-group">
              <input 
                type="text" 
                id="nftId"
                [(ngModel)]="nftLookupId" 
                placeholder="000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE"
                [class.error]="nftLookupError"
                class="hex-input">
              <button (click)="lookupNFT()" [disabled]="!nftLookupId || loading" class="lookup-btn">
                Search NFT
              </button>
            </div>
            <div class="input-help">Enter the complete 64-character hexadecimal NFT ID</div>
          </div>

          <!-- NFT Results -->
          <div class="nft-result" *ngIf="nftResult">
            <div class="nft-card">
              <div class="nft-header">
                <img [src]="nftResult.data.imageUrl" [alt]="nftResult.data.name" 
                     class="nft-image" 
                     (error)="onImageError($event)">
                <div class="nft-info">
                  <h3>{{ nftResult.data.name }}</h3>
                  <p class="nft-description">{{ nftResult.data.description }}</p>
                  <div class="nft-meta">
                    <div class="meta-item">
                      <span class="meta-label">Category:</span>
                      <span class="meta-value">{{ nftResult.data.category }}</span>
                    </div>
                    <div class="meta-item" *ngIf="nftResult.data.rarity">
                      <span class="meta-label">Rarity:</span>
                      <span class="meta-value rarity">{{ nftResult.data.rarity }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Status:</span>
                      <span class="meta-value" [class]="nftResult.data.isBurned ? 'burned' : 'active'">
                        {{ nftResult.data.isBurned ? 'Burned' : 'Active' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="nft-attributes" *ngIf="nftResult.data.attributes.length > 0">
                <h4>Attributes</h4>
                <div class="attributes-grid">
                  <div class="attribute" *ngFor="let attr of nftResult.data.attributes">
                    <div class="attr-type">{{ attr.trait_type }}</div>
                    <div class="attr-value">{{ attr.value }}</div>
                  </div>
                </div>
              </div>

              <div class="nft-blockchain">
                <h4>Blockchain Data</h4>
                <div class="blockchain-grid">
                  <div class="blockchain-item">
                    <span class="blockchain-label">NFT ID:</span>
                    <span class="blockchain-value mono">{{ nftResult.data.nftId }}</span>
                  </div>
                  <div class="blockchain-item">
                    <span class="blockchain-label">Owner:</span>
                    <span class="blockchain-value mono">{{ nftResult.data.owner.address }}</span>
                  </div>
                  <div class="blockchain-item">
                    <span class="blockchain-label">Issuer:</span>
                    <span class="blockchain-value mono">{{ nftResult.data.issuer.address }}</span>
                  </div>
                  <div class="blockchain-item">
                    <span class="blockchain-label">Tx Hash:</span>
                    <span class="blockchain-value mono">{{ nftResult.data.txHash }}</span>
                  </div>
                  <div class="blockchain-item">
                    <span class="blockchain-label">Fee:</span>
                    <span class="blockchain-value">{{ nftResult.data.fee }} drops</span>
                  </div>
                  <div class="blockchain-item">
                    <span class="blockchain-label">Minted:</span>
                    <span class="blockchain-value">{{ formatDate(nftResult.data.mintedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Explorer Tab -->
        <div class="query-panel" *ngIf="activeTab === 'account-explorer'">
          <div class="form-group">
            <label for="accountAddress">XRPL Account Address</label>
            <div class="input-group">
              <input 
                type="text" 
                id="accountAddress"
                [(ngModel)]="accountAddress" 
                placeholder="rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b"
                [class.error]="accountError"
                class="address-input">
              <button (click)="exploreAccount()" [disabled]="!accountAddress || loading" class="lookup-btn">
                Explore Account
              </button>
            </div>
            <div class="input-help">Enter a valid XRPL address starting with 'r'</div>
          </div>

          <!-- Account Results -->
          <div class="account-results" *ngIf="accountNFTs">
            <div class="results-header">
              <h3>NFTs for {{ accountNFTs.data.account.substring(0, 15) }}...</h3>
              <div class="results-meta">
                <span>{{ accountNFTs.data.count }} NFT{{ accountNFTs.data.count !== 1 ? 's' : '' }} found</span>
                <span>•</span>
                <span>Showing {{ accountNFTs.data.nfts.length }} of {{ accountNFTs.data.count }}</span>
              </div>
            </div>

            <div class="nfts-grid" *ngIf="accountNFTs.data.nfts.length > 0">
              <div class="nft-card-mini" *ngFor="let nft of accountNFTs.data.nfts; trackBy: trackByNftId">
                <img [src]="nft.imageUrl" [alt]="nft.name" 
                     class="nft-thumbnail"
                     (error)="onImageError($event)">
                <div class="nft-mini-info">
                  <div class="nft-mini-name">{{ nft.name }}</div>
                  <div class="nft-mini-meta">
                    <span class="mini-category">{{ nft.category }}</span>
                    <span class="mini-date">{{ formatShortDate(nft.mintedAt) }}</span>
                  </div>
                  <button (click)="viewNFTDetails(nft.nftId)" class="view-btn">View Details</button>
                </div>
              </div>
            </div>

            <div class="empty-state" *ngIf="accountNFTs.data.nfts.length === 0">
              <div class="empty-icon">📭</div>
              <div class="empty-message">No NFTs found for this account</div>
            </div>
          </div>
        </div>

        <!-- API Tester Tab -->
        <div class="query-panel" *ngIf="activeTab === 'api-tester'">
          <div class="api-endpoints">
            <h3>Available Data API Endpoints</h3>
            <div class="endpoints-grid">
              <button 
                *ngFor="let endpoint of apiEndpoints"
                (click)="testEndpoint(endpoint)"
                [disabled]="loading"
                class="endpoint-btn">
                <span [innerHTML]="endpoint.icon"></span>
                <div class="endpoint-info">
                  <div class="endpoint-name">{{ endpoint.name }}</div>
                  <div class="endpoint-path">{{ endpoint.path }}</div>
                </div>
              </button>
            </div>
          </div>

          <div class="api-result" *ngIf="apiTestResult">
            <h4>API Response</h4>
            <div class="response-meta">
              <span class="response-status" [class]="apiTestResult.success ? 'success' : 'error'">
                {{ apiTestResult.success ? '✅ Success' : '❌ Error' }}
              </span>
              <span class="response-time">{{ apiTestTime }}ms</span>
            </div>
            <pre class="response-json">{{ apiTestResult | json }}</pre>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
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
    .data-explorer {
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

    /* Status Grid */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .status-card {
      padding: 1.5rem;
      border-radius: 1rem;
      border: 2px solid;
      transition: all 0.3s ease;
    }

    .status-card.healthy, .status-card.connected {
      background: rgba(34, 197, 94, 0.1);
      border-color: rgba(34, 197, 94, 0.3);
      color: rgb(34, 197, 94);
    }

    .status-card.unhealthy, .status-card.disconnected, .status-card.error {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: rgb(239, 68, 68);
    }

    .status-card.not_configured {
      background: rgba(251, 191, 36, 0.1);
      border-color: rgba(251, 191, 36, 0.3);
      color: rgb(251, 191, 36);
    }

    .status-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .status-icon {
      font-size: 2rem;
    }

    .status-header h3 {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0;
      color: rgb(var(--color-text-primary));
    }

    .status-value {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }

    .status-meta {
      font-size: 0.875rem;
      opacity: 0.8;
      color: rgb(var(--color-text-secondary));
    }

    /* Stats Grid */
    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-section h2 {
      font-size: 1.875rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(var(--color-bg-secondary), 0.8);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      border-color: rgba(249, 115, 22, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      font-weight: 500;
    }

    /* Query Section */
    .query-section {
      margin-top: 2rem;
    }

    .query-section h2 {
      font-size: 1.875rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1.5rem;
    }

    .query-tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .tab-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border: 2px solid rgba(var(--color-bg-tertiary), 0.5);
      border-radius: 0.5rem;
      background: rgba(var(--color-bg-secondary), 0.5);
      color: rgb(var(--color-text-secondary));
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      border-color: rgba(249, 115, 22, 0.3);
      color: rgb(var(--color-text-primary));
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #f97316, #ea580c);
      border-color: #ea580c;
      color: white;
    }

    .query-panel {
      background: rgba(var(--color-bg-secondary), 0.8);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
    }

    .input-group input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid rgba(var(--color-bg-tertiary), 0.5);
      border-radius: 0.5rem;
      background: rgba(var(--color-bg-primary), 0.8);
      color: rgb(var(--color-text-primary));
      font-family: monospace;
    }

    .input-group input:focus {
      outline: none;
      border-color: rgba(249, 115, 22, 0.5);
    }

    .input-group input.error {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .lookup-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .lookup-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      transform: translateY(-1px);
    }

    .lookup-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .input-help {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      margin-top: 0.5rem;
    }

    /* NFT Result Card */
    .nft-result {
      margin-top: 2rem;
    }

    .nft-card {
      background: rgba(var(--color-bg-primary), 0.9);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      overflow: hidden;
    }

    .nft-header {
      display: flex;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .nft-image {
      width: 150px;
      height: 150px;
      object-fit: cover;
      border-radius: 0.5rem;
      background: rgba(var(--color-bg-tertiary), 0.5);
    }

    .nft-info {
      flex: 1;
    }

    .nft-info h3 {
      font-size: 1.5rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
    }

    .nft-description {
      color: rgb(var(--color-text-secondary));
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .nft-meta {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      gap: 0.5rem;
    }

    .meta-label {
      font-weight: 500;
      color: rgb(var(--color-text-secondary));
    }

    .meta-value {
      font-weight: 600;
      color: rgb(var(--color-text-primary));
    }

    .meta-value.rarity {
      color: #f59e0b;
      text-transform: capitalize;
    }

    .meta-value.burned {
      color: #ef4444;
    }

    .meta-value.active {
      color: #22c55e;
    }

    /* NFT Attributes */
    .nft-attributes {
      padding: 1.5rem;
      border-top: 1px solid rgba(249, 115, 22, 0.2);
    }

    .nft-attributes h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1rem;
    }

    .attributes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .attribute {
      background: rgba(var(--color-bg-tertiary), 0.5);
      border-radius: 0.5rem;
      padding: 1rem;
      text-align: center;
    }

    .attr-type {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .attr-value {
      font-weight: bold;
      color: rgb(var(--color-text-primary));
    }

    /* Blockchain Data */
    .nft-blockchain {
      padding: 1.5rem;
      border-top: 1px solid rgba(249, 115, 22, 0.2);
    }

    .nft-blockchain h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1rem;
    }

    .blockchain-grid {
      display: grid;
      gap: 0.75rem;
    }

    .blockchain-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .blockchain-label {
      min-width: 80px;
      font-weight: 500;
      color: rgb(var(--color-text-secondary));
    }

    .blockchain-value {
      flex: 1;
      font-weight: 500;
      color: rgb(var(--color-text-primary));
      word-break: break-all;
    }

    .blockchain-value.mono {
      font-family: monospace;
      font-size: 0.875rem;
    }

    /* Account Results */
    .results-header {
      margin-bottom: 1.5rem;
    }

    .results-header h3 {
      font-size: 1.5rem;
      font-weight: bold;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
    }

    .results-meta {
      color: rgb(var(--color-text-secondary));
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .nfts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .nft-card-mini {
      background: rgba(var(--color-bg-primary), 0.9);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .nft-card-mini:hover {
      border-color: rgba(249, 115, 22, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .nft-thumbnail {
      width: 100%;
      height: 150px;
      object-fit: cover;
      background: rgba(var(--color-bg-tertiary), 0.5);
    }

    .nft-mini-info {
      padding: 1rem;
    }

    .nft-mini-name {
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .nft-mini-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .mini-category {
      font-size: 0.75rem;
      color: rgb(var(--color-text-secondary));
      text-transform: capitalize;
    }

    .mini-date {
      font-size: 0.75rem;
      color: rgb(var(--color-text-secondary));
    }

    .view-btn {
      width: 100%;
      padding: 0.5rem;
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn:hover {
      background: linear-gradient(135deg, #ea580c, #dc2626);
    }

    /* API Testing */
    .endpoints-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .endpoint-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(var(--color-bg-secondary), 0.8);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .endpoint-btn:hover:not(:disabled) {
      border-color: rgba(249, 115, 22, 0.4);
      transform: translateY(-1px);
    }

    .endpoint-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .endpoint-info {
      flex: 1;
      text-align: left;
    }

    .endpoint-name {
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 0.25rem;
    }

    .endpoint-path {
      font-size: 0.875rem;
      color: rgb(var(--color-text-secondary));
      font-family: monospace;
    }

    .api-result {
      margin-top: 1.5rem;
    }

    .api-result h4 {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgb(var(--color-text-primary));
      margin-bottom: 1rem;
    }

    .response-meta {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .response-status.success {
      color: #22c55e;
      font-weight: 500;
    }

    .response-status.error {
      color: #ef4444;
      font-weight: 500;
    }

    .response-time {
      color: rgb(var(--color-text-secondary));
      font-size: 0.875rem;
    }

    .response-json {
      background: rgba(var(--color-bg-primary), 0.9);
      border: 2px solid rgba(249, 115, 22, 0.2);
      border-radius: 0.5rem;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.875rem;
      color: rgb(var(--color-text-primary));
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 400px;
      overflow-y: auto;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: rgb(var(--color-text-secondary));
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-message {
      font-size: 1.125rem;
      font-weight: 500;
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
      .data-explorer {
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

      .status-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      .nft-header {
        flex-direction: column;
      }

      .nft-image {
        width: 100%;
        height: 200px;
      }

      .blockchain-item {
        flex-direction: column;
        gap: 0.25rem;
      }

      .blockchain-label {
        min-width: auto;
      }

      .endpoints-grid {
        grid-template-columns: 1fr;
      }

      .query-tabs {
        flex-direction: column;
      }

      .tab-btn {
        justify-content: center;
      }
    }
  `]
})
export class DataExplorerComponent implements OnInit {
  // System status
  systemHealth: DetailedHealthResponse | null = null;
  walletInfo: WalletInfoResponse | null = null;
  nftStats: NFTStatsResponse | null = null;
  collectionAnalytics: any = null;

  // Query states
  activeTab = 'nft-lookup';
  nftLookupId = '';
  nftLookupError = false;
  nftResult: NFTDetailsResponse | null = null;
  
  accountAddress = '';
  accountError = false;
  accountNFTs: AccountNFTsResponse | null = null;

  // API testing
  apiTestResult: any = null;
  apiTestTime = 0;

  // UI state
  loading = false;
  loadingMessage = '';
  errorMessage = '';

  queryTabs = [
    { id: 'nft-lookup', label: 'NFT Lookup', icon: '🎴' },
    { id: 'account-explorer', label: 'Account Explorer', icon: '👤' },
    { id: 'api-tester', label: 'API Tester', icon: '🧪' }
  ];

  apiEndpoints = [
    { name: 'System Health', path: '/health/detailed', icon: '🏥' },
    { name: 'NFT Statistics', path: '/stats/nft', icon: '📊' },
    { name: 'Wallet Info', path: '/nft/wallet/info', icon: '💰' },
    { name: 'Basic Health', path: '/health', icon: '💓' }
  ];

  constructor(
    private dataApiService: DataApiService,
    public router: Router
  ) {}

  ngOnInit() {
    this.refreshSystemStatus();
  }

  refreshSystemStatus() {
    this.loading = true;
    this.loadingMessage = 'Loading system status...';
    
    // Load system health
    this.dataApiService.getDetailedHealth().subscribe({
      next: (health) => {
        this.systemHealth = health;
        this.loadWalletInfo();
      },
      error: (error) => {
        this.handleError('Failed to load system health', error);
        this.loading = false;
      }
    });
  }

  private loadWalletInfo() {
    this.dataApiService.getWalletInfo().subscribe({
      next: (wallet) => {
        this.walletInfo = wallet;
        this.loadNFTStats();
      },
      error: (error) => {
        this.handleError('Failed to load wallet info', error);
        this.loading = false;
      }
    });
  }

  private loadNFTStats() {
    this.dataApiService.getNFTStatistics().subscribe({
      next: (stats) => {
        this.nftStats = stats;
        this.collectionAnalytics = this.dataApiService.calculateCollectionAnalytics(stats.data);
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Failed to load NFT statistics', error);
        this.loading = false;
      }
    });
  }

  lookupNFT() {
    if (!this.nftLookupId) {
      this.nftLookupError = true;
      return;
    }

    if (!this.dataApiService.isValidNFTId(this.nftLookupId)) {
      this.nftLookupError = true;
      this.showError('Invalid NFT ID format. Must be 64-character hexadecimal.');
      return;
    }

    this.nftLookupError = false;
    this.loading = true;
    this.loadingMessage = 'Looking up NFT...';

    this.dataApiService.getNFTById(this.nftLookupId).subscribe({
      next: (result) => {
        this.nftResult = result;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Failed to lookup NFT', error);
        this.loading = false;
      }
    });
  }

  exploreAccount() {
    if (!this.accountAddress) {
      this.accountError = true;
      return;
    }

    if (!this.dataApiService.isValidXRPLAddress(this.accountAddress)) {
      this.accountError = true;
      this.showError('Invalid XRPL address format. Must start with "r".');
      return;
    }

    this.accountError = false;
    this.loading = true;
    this.loadingMessage = 'Loading account NFTs...';

    this.dataApiService.getAccountNFTs(this.accountAddress).subscribe({
      next: (result) => {
        this.accountNFTs = result;
        this.loading = false;
      },
      error: (error) => {
        this.handleError('Failed to load account NFTs', error);
        this.loading = false;
      }
    });
  }

  viewNFTDetails(nftId: string) {
    this.activeTab = 'nft-lookup';
    this.nftLookupId = nftId;
    this.lookupNFT();
  }

  testEndpoint(endpoint: any) {
    this.loading = true;
    this.loadingMessage = `Testing ${endpoint.name}...`;
    const startTime = Date.now();

    this.dataApiService.makeApiCall(endpoint.path).subscribe({
      next: (result) => {
        this.apiTestTime = Date.now() - startTime;
        this.apiTestResult = result;
        this.loading = false;
      },
      error: (error) => {
        this.apiTestTime = Date.now() - startTime;
        this.apiTestResult = error.error || error;
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status || 'unknown';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }

  formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  trackByNftId(index: number, nft: any): string {
    return nft.nftId;
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

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuM2VtIiBmaWxsPSIjNmI3MjgwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
  }
}
