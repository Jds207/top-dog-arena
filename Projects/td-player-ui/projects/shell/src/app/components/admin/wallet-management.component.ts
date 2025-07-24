import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, CreateWalletRequest, CreateWalletResponse, WalletListResponse, FundWalletRequest, WalletInfo, WalletStatsResponse, SyncAllBalancesResponse, SyncBalanceResponse } from '../../services/api.service';

interface WalletDisplay {
  id: string;
  address: string;
  network: 'testnet' | 'mainnet' | 'devnet';
  balance: string | null; // Balance in drops
  balanceXRP: string | null; // Balance in XRP
  isOwned: boolean;
  isActive: boolean;
  nickname?: string | null;
  description?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string | null;
  nftCount: {
    owned: number;
    issued: number;
  };
  publicKey?: string | null;
  hasSeed?: boolean | null;
  hasPrivateKey?: boolean | null;
  isNew?: boolean;
}

@Component({
  selector: 'app-wallet-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="wallet-management">
      <div class="management-container">
        <!-- Header -->
        <div class="page-header">
          <h1>💰 Wallet Management</h1>
          <p>Create and manage XRPL wallets for the Top Dog Arena platform</p>
        </div>

        <!-- Wallet Statistics -->
        <div class="wallet-stats-section" *ngIf="walletStats || loadingStats">
          <h2>📊 Wallet Statistics</h2>
          <div *ngIf="loadingStats" class="loading-state">
            <p>⏳ Loading statistics...</p>
          </div>
          <div *ngIf="!loadingStats && walletStats" class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ walletStats.totalWallets }}</div>
              <div class="stat-label">Total Wallets</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ walletStats.fundedWallets }}/{{ walletStats.unfundedWallets }}</div>
              <div class="stat-label">Funded/Unfunded</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ walletStats.activeWallets }}</div>
              <div class="stat-label">Active Wallets</div>
            </div>
            <div class="stat-card">
              <button 
                (click)="syncAllBalances()"
                [disabled]="syncingBalances"
                class="sync-all-btn"
              >
                {{ syncingBalances ? '⏳ Syncing...' : '🔄 Sync All Balances' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Create New Wallet Section -->
        <div class="create-wallet-section">
          <h2>🆕 Create New Wallet</h2>
          <div class="create-wallet-form">
            <div class="form-row">
              <div class="form-group">
                <label for="walletName">Wallet Name (Optional)</label>
                <input
                  id="walletName"
                  [(ngModel)]="newWallet.name"
                  type="text"
                  placeholder="e.g., Player Wallet #1"
                  class="form-input"
                >
              </div>
              <div class="form-group">
                <label for="walletDescription">Description (Optional)</label>
                <input
                  id="walletDescription"
                  [(ngModel)]="newWallet.description"
                  type="text"
                  placeholder="e.g., Main trading wallet"
                  class="form-input"
                >
              </div>
            </div>
            <div class="form-actions">
              <button 
                (click)="createNewWallet()"
                [disabled]="creatingWallet"
                class="create-btn"
              >
                {{ creatingWallet ? '⏳ Creating...' : '🔨 Create Wallet' }}
              </button>
              <div class="create-options">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="autoFundNew"
                  >
                  <span class="checkmark"></span>
                  Auto-fund with 1000 XRP (Testnet)
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Creation Success -->
        <div *ngIf="newlyCreatedWallet" class="wallet-created-success">
          <h3>✅ Wallet Created Successfully!</h3>
          <div class="created-wallet-info">
            <div class="security-warning">
              <h4>🔐 Important Security Information</h4>
              <p><strong>Save this information immediately! It will only be shown once.</strong></p>
            </div>
            
            <div class="wallet-details">
              <div class="detail-item">
                <label>Address:</label>
                <code class="address-display">{{ newlyCreatedWallet.address }}</code>
                <button (click)="copyToClipboard(newlyCreatedWallet.address)" class="copy-btn">📋</button>
              </div>
              
              <div class="detail-item">
                <label>Public Key:</label>
                <code class="key-display">{{ newlyCreatedWallet.publicKey }}</code>
                <button (click)="copyToClipboard(newlyCreatedWallet.publicKey)" class="copy-btn">📋</button>
              </div>
              
              <div class="detail-item" *ngIf="newlyCreatedWallet.seed">
                <label>🔐 Seed (SAVE THIS!):</label>
                <code class="private-key-display" [class.hidden]="hideSeed">
                  {{ hideSeed ? '••••••••••••••••••••••••••••••••' : newlyCreatedWallet.seed }}
                </code>
                <button (click)="toggleSeedVisibility()" class="toggle-btn">
                  {{ hideSeed ? '👁️ Show' : '🙈 Hide' }}
                </button>
                <button (click)="copyToClipboard(newlyCreatedWallet.seed)" class="copy-btn">📋</button>
                <small class="warning">⚠️ Store securely - cannot be recovered!</small>
              </div>
              
              <div class="detail-item" *ngIf="newlyCreatedWallet.seed">
                <label>Seed:</label>
                <code class="seed-display" [class.hidden]="hideSeed">
                  {{ hideSeed ? '••••••••••••••••••••••••••••••••' : newlyCreatedWallet.seed }}
                </code>
                <button (click)="toggleSeedVisibility()" class="toggle-btn">
                  {{ hideSeed ? '👁️ Show' : '🙈 Hide' }}
                </button>
                <button (click)="copyToClipboard(newlyCreatedWallet.seed!)" class="copy-btn">📋</button>
              </div>
            </div>
            
            <div class="wallet-actions">
              <button (click)="clearNewWalletInfo()" class="clear-btn">
                ✅ I've Saved This Information
              </button>
              <button (click)="connectToNewWallet()" class="connect-btn">
                🔗 Connect to This Wallet
              </button>
            </div>
          </div>
        </div>

        <!-- Existing Wallets List -->
        <div class="wallets-list-section">
          <div class="section-header">
            <h2>📋 Existing Wallets</h2>
            <div class="list-actions">
              <button 
                (click)="refreshWalletList()"
                [disabled]="loadingWallets"
                class="refresh-btn"
              >
                {{ loadingWallets ? '⏳' : '🔄' }} Refresh
              </button>
              <span class="wallet-count">{{ wallets.length }} wallets</span>
            </div>
          </div>

          <div *ngIf="loadingWallets" class="loading-state">
            <p>⏳ Loading wallets...</p>
          </div>

          <div *ngIf="!loadingWallets && wallets.length === 0" class="empty-state">
            <p>No wallets found. Create your first wallet above!</p>
          </div>

          <div *ngIf="!loadingWallets && wallets.length > 0" class="wallets-grid">
            <div 
              *ngFor="let wallet of wallets" 
              class="wallet-card"
              [class.new-wallet]="wallet.isNew"
            >
              <div class="wallet-header">
                <h3>{{ getWalletDisplayName(wallet) }}</h3>
                <span class="wallet-balance">{{ formatBalance(wallet.balance || '0') }}</span>
              </div>
              
              <div class="wallet-info">
                <div class="info-item">
                  <label>Address:</label>
                  <code class="wallet-address">{{ wallet.address.slice(0, 20) }}...</code>
                  <button (click)="copyToClipboard(wallet.address)" class="copy-btn-small">📋</button>
                </div>
                
                <div class="info-item" *ngIf="getFormattedDescription(wallet.description || wallet.nickname || '')">
                  <label>Description:</label>
                  <span class="wallet-description">{{ getFormattedDescription(wallet.description || wallet.nickname || '') }}</span>
                </div>
                
                <div class="info-item">
                  <label>NFTs:</label>
                  <span class="nft-count">{{ getNftDisplayText(wallet.nftCount) }}</span>
                </div>
                
                <div class="info-item" *ngIf="wallet.lastSyncAt">
                  <label>Last Sync:</label>
                  <span>{{ formatDate(wallet.lastSyncAt) }}</span>
                </div>
              </div>
              
              <div class="wallet-actions">
                <button 
                  (click)="connectToWallet(wallet.address)"
                  class="action-btn connect"
                >
                  🔗 Connect
                </button>
                <button 
                  (click)="syncWalletBalance(wallet.address)"
                  [disabled]="fundingWallet === wallet.address"
                  class="action-btn sync"
                >
                  🔄 Sync
                </button>
                <button 
                  (click)="fundWallet(wallet.address)"
                  [disabled]="fundingWallet === wallet.address"
                  class="action-btn fund"
                >
                  {{ fundingWallet === wallet.address ? '⏳' : '💰' }} Fund
                </button>
                <button 
                  (click)="viewWalletDetails(wallet.address)"
                  class="action-btn details"
                >
                  📊 Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Fund Wallet Modal -->
        <div *ngIf="showFundModal" class="modal-overlay" (click)="!fundingWallet && closeFundModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>💰 Fund Wallet</h3>
            <p>Add testnet XRP to wallet: <code>{{ fundingAddress }}</code></p>
            
            <!-- Loading Overlay -->
            <div *ngIf="fundingWallet" class="loading-overlay">
              <div class="loading-spinner">
                <div class="spinner"></div>
                <p>⏳ Funding wallet...</p>
                <p class="loading-details">Please wait while we process your funding request</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="fundAmount">Amount (XRP)</label>
              <input
                id="fundAmount"
                [(ngModel)]="fundAmount"
                type="number"
                min="1"
                max="10000"
                placeholder="1000"
                class="form-input"
                [disabled]="!!fundingWallet"
              >
            </div>
            
            <div class="modal-actions">
              <button 
                (click)="confirmFundWallet()" 
                [disabled]="!!fundingWallet"
                class="fund-confirm-btn"
              >
                {{ fundingWallet ? '⏳ Funding...' : '💰 Fund Wallet' }}
              </button>
              <button 
                (click)="closeFundModal()" 
                [disabled]="!!fundingWallet"
                class="cancel-btn"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Error Messages -->
        <div *ngIf="errorMessage" class="error-message">
          <p>❌ {{ errorMessage }}</p>
          <button (click)="clearError()" class="clear-error-btn">✕</button>
        </div>

        <!-- Success Messages -->
        <div *ngIf="successMessage" class="success-message">
          <p>✅ {{ successMessage }}</p>
          <button (click)="clearSuccess()" class="clear-success-btn">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wallet-management {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: white;
      padding: 2rem;
    }

    .management-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .page-header h1 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
      color: #fbbf24;
    }

    .page-header p {
      margin: 0;
      opacity: 0.8;
      font-size: 1.1rem;
    }

    .create-wallet-section,
    .wallets-list-section,
    .wallet-stats-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .create-wallet-section h2,
    .wallets-list-section h2,
    .wallet-stats-section h2 {
      margin: 0 0 1.5rem 0;
      color: #fbbf24;
    }

    .wallet-stats-section {
      border-color: rgba(59, 130, 246, 0.3);
      background: rgba(59, 130, 246, 0.05);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .sync-all-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }

    .sync-all-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .sync-all-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: bold;
      opacity: 0.9;
    }

    .form-input {
      padding: 0.75rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #fbbf24;
    }

    .form-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .form-actions {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .create-btn {
      padding: 0.75rem 2rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .create-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .create-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .checkmark {
      display: inline-block;
    }

    .wallet-created-success {
      background: rgba(34, 197, 94, 0.1);
      border: 2px solid rgba(34, 197, 94, 0.5);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .wallet-created-success h3 {
      margin: 0 0 1.5rem 0;
      color: #10b981;
    }

    .security-warning {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .security-warning h4 {
      margin: 0 0 0.5rem 0;
      color: #f59e0b;
    }

    .security-warning p {
      margin: 0;
      font-weight: bold;
    }

    .wallet-details {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .detail-item label {
      font-weight: bold;
      min-width: 100px;
      color: #fbbf24;
    }

    .address-display,
    .key-display,
    .private-key-display,
    .seed-display {
      flex: 1;
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      word-break: break-all;
    }

    .private-key-display,
    .seed-display {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .copy-btn,
    .toggle-btn {
      padding: 0.5rem;
      background: rgba(59, 130, 246, 0.8);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .toggle-btn {
      background: rgba(245, 158, 11, 0.8);
    }

    .copy-btn:hover,
    .toggle-btn:hover {
      transform: scale(1.05);
    }

    .wallet-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .clear-btn,
    .connect-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .clear-btn {
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
    }

    .connect-btn {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      color: white;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .list-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .refresh-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .refresh-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .refresh-btn:disabled {
      opacity: 0.6;
    }

    .wallet-count {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: 3rem;
      opacity: 0.6;
    }

    .wallets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .wallet-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
    }

    .wallet-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .wallet-card:hover {
      transform: translateY(-2px);
      border-color: rgba(251, 191, 36, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .wallet-card:hover::before {
      opacity: 1;
    }

    .wallet-card.new-wallet {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.05);
    }

    .wallet-card.new-wallet::before {
      background: linear-gradient(90deg, #10b981, #059669);
      opacity: 1;
    }

    .wallet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .wallet-header h3 {
      margin: 0;
      color: #fbbf24;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .wallet-balance {
      font-weight: bold;
      color: #10b981;
      font-size: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 20px;
      font-family: 'Courier New', monospace;
    }

    .wallet-info {
      margin-bottom: 1rem;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 6px;
      font-size: 0.9rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item label {
      font-weight: bold;
      min-width: 80px;
      opacity: 0.8;
      color: #fbbf24;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .wallet-address {
      font-family: 'Courier New', monospace;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      border: 1px solid rgba(59, 130, 246, 0.2);
    }

    .wallet-description {
      font-style: italic;
      opacity: 0.9;
      font-size: 0.85rem;
    }

    .nft-count {
      color: #10b981;
      font-weight: 600;
    }

    .copy-btn-small {
      padding: 0.25rem;
      background: rgba(59, 130, 246, 0.8);
      border: none;
      border-radius: 3px;
      color: white;
      cursor: pointer;
      font-size: 0.7rem;
    }

    .wallet-card .wallet-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      justify-content: stretch;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .action-btn {
      padding: 0.6rem 0.75rem;
      border: none;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .action-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.1);
      transition: left 0.3s ease;
    }

    .action-btn:hover::before {
      left: 100%;
    }

    .action-btn.connect {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      color: white;
    }

    .action-btn.sync {
      background: linear-gradient(45deg, #06b6d4, #0891b2);
      color: white;
    }

    .action-btn.fund {
      background: linear-gradient(45deg, #f59e0b, #d97706);
      color: white;
    }

    .action-btn.details {
      background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .action-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      position: relative;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(30, 41, 59, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      border-radius: 12px;
    }

    .loading-spinner {
      text-align: center;
      color: #fbbf24;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(251, 191, 36, 0.3);
      border-top: 4px solid #fbbf24;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem auto;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-details {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }

    .modal-content h3 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }

    .fund-confirm-btn {
      background: linear-gradient(45deg, #10b981, #059669);
    }

    .cancel-btn {
      background: linear-gradient(45deg, #ef4444, #dc2626);
    }

    .fund-confirm-btn,
    .cancel-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .error-message,
    .success-message {
      position: fixed;
      top: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 1rem;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    }

    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 2px solid rgba(239, 68, 68, 0.5);
    }

    .success-message {
      background: rgba(34, 197, 94, 0.1);
      border: 2px solid rgba(34, 197, 94, 0.5);
    }

    .clear-error-btn,
    .clear-success-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.2rem;
      opacity: 0.7;
    }

    .clear-error-btn:hover,
    .clear-success-btn:hover {
      opacity: 1;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .wallets-grid {
        grid-template-columns: 1fr;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .wallet-card .wallet-actions {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .action-btn {
        width: 100%;
        padding: 0.75rem;
      }

      .wallet-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .wallet-balance {
        align-self: flex-end;
      }
    }

    @media (max-width: 480px) {
      .wallet-management {
        padding: 1rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .page-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class WalletManagementComponent implements OnInit {
  wallets: WalletDisplay[] = [];
  newWallet: CreateWalletRequest = {};
  newlyCreatedWallet: CreateWalletResponse['data'] | null = null;
  walletStats: any = null;
  
  // Loading states
  loadingWallets = false;
  creatingWallet = false;
  fundingWallet: string | null = null;
  syncingBalances = false;
  loadingStats = false;
  
  // UI states
  hidePrivateKey = true;
  hideSeed = true;
  autoFundNew = true;
  
  // Modal states
  showFundModal = false;
  fundingAddress = '';
  fundAmount = 1000;
  
  // Messages
  errorMessage = '';
  successMessage = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadWalletList();
    this.loadWalletStatistics();
  }

  async createNewWallet(): Promise<void> {
    this.creatingWallet = true;
    this.clearMessages();

    try {
      const response = await this.apiService.createWallet(this.newWallet).toPromise();
      
      if (response?.success && response.data) {
        this.newlyCreatedWallet = response.data;
        this.successMessage = 'Wallet created successfully!';
        
        // Auto-fund if requested
        if (this.autoFundNew) {
          await this.fundWalletByAddress(response.data.address, 1000);
        }
        
        // Reset form
        this.newWallet = {};
        
        // Refresh wallet list
        await this.loadWalletList();
        
        // Mark as new wallet
        const newWalletInList = this.wallets.find(w => w.address === response.data!.address);
        if (newWalletInList) {
          newWalletInList.isNew = true;
        }
      } else {
        this.errorMessage = response?.message || 'Failed to create wallet';
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      this.errorMessage = error?.error?.message || error?.message || 'Failed to create wallet';
    } finally {
      this.creatingWallet = false;
    }
  }

  async loadWalletList(): Promise<void> {
    this.loadingWallets = true;
    this.clearMessages();

    try {
      console.log('🔍 Calling wallet list API: http://localhost:3000/api/wallet/list');
      const response = await this.apiService.getWalletList().toPromise();
      console.log('📡 Raw wallet list response:', response);
      
      if (response?.success && response.data) {
        console.log('💰 Raw wallet data from API:', response.data);
        
        // Process the wallet data to handle different NFT formats and balance structures
        this.wallets = response.data.wallets.map((wallet: any) => {
          console.log(`🔍 Processing wallet ${wallet.address}:`, wallet);
          
          const originalNftData = wallet.nftCount || wallet.nfts || 0;
          const processedCount = this.processNftCount(originalNftData);
          
          // Process balance - handle different API response formats (XRP and drops)
          let processedBalance = '0';
          let processedBalanceXRP = '0';
          
          if (wallet.balance !== undefined) {
            if (typeof wallet.balance === 'string' || typeof wallet.balance === 'number') {
              // Direct balance format: could be XRP ("10") or drops ("10000000")
              const balanceValue = parseFloat(String(wallet.balance));
              if (!isNaN(balanceValue)) {
                // If balance is > 1000, assume it's in drops, otherwise XRP
                if (balanceValue > 1000) {
                  // Likely drops format (1 XRP = 1,000,000 drops)
                  processedBalance = (balanceValue / 1000000).toFixed(6);
                  console.log(`💰 Drops balance for ${wallet.address}: ${wallet.balance} drops → ${processedBalance} XRP`);
                } else {
                  // Likely XRP format
                  processedBalance = balanceValue.toString();
                  console.log(`💰 XRP balance for ${wallet.address}: ${wallet.balance} XRP`);
                }
              }
            } else if (typeof wallet.balance === 'object' && wallet.balance !== null) {
              // Nested balance format: { drops: "30000000", xrp: "30.0" } or { balance: "10", available: "10" }
              if (wallet.balance.xrp !== undefined) {
                // Format: { drops: "30000000", xrp: "30.0" }
                const parsedBalance = parseFloat(String(wallet.balance.xrp));
                if (!isNaN(parsedBalance)) {
                  processedBalance = parsedBalance.toString();
                }
                console.log(`💰 XRP nested balance for ${wallet.address}: ${wallet.balance.xrp} XRP`);
              } else if (wallet.balance.drops !== undefined) {
                // Format: { drops: "30000000" }
                const parsedBalance = parseFloat(String(wallet.balance.drops));
                if (!isNaN(parsedBalance)) {
                  processedBalance = (parsedBalance / 1000000).toFixed(6);
                }
                console.log(`💰 Drops nested balance for ${wallet.address}: ${wallet.balance.drops} drops → ${processedBalance} XRP`);
              } else if (wallet.balance.balance !== undefined) {
                // Legacy format: { balance: "10" }
                const parsedBalance = parseFloat(String(wallet.balance.balance));
                if (!isNaN(parsedBalance)) {
                  processedBalance = parsedBalance.toString();
                }
                console.log(`💰 Legacy nested balance for ${wallet.address}: ${wallet.balance.balance}`);
              } else if (wallet.balance.available !== undefined) {
                // Legacy format: { available: "10" }
                const parsedBalance = parseFloat(String(wallet.balance.available));
                if (!isNaN(parsedBalance)) {
                  processedBalance = parsedBalance.toString();
                }
                console.log(`💰 Legacy available balance for ${wallet.address}: ${wallet.balance.available}`);
              } else {
                console.warn(`⚠️ Unknown balance structure for ${wallet.address}:`, wallet.balance);
              }
            }
          }
          
          // Check if there's a separate balanceXRP field (WalletInfo schema)
          if (wallet.balanceXRP !== undefined) {
            const parsedXRP = parseFloat(String(wallet.balanceXRP));
            if (!isNaN(parsedXRP)) {
              processedBalance = parsedXRP.toString();
              console.log(`💰 Dedicated balanceXRP for ${wallet.address}: ${wallet.balanceXRP} XRP`);
            }
          }
          
          // Log specific wallet with your funded address
          if (wallet.address === 'rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD') {
            console.log('🎯 FUNDED WALLET FOUND:', {
              address: wallet.address,
              originalBalance: wallet.balance,
              processedBalance: processedBalance,
              rawWallet: wallet
            });
          }
          
          return {
            ...wallet,
            balance: processedBalance, // Override with processed balance
            nftCount: processedCount,
            originalNftData: originalNftData // Store original for detailed display
          };
        });
        
        console.log('✅ Processed wallets:', this.wallets);
      } else {
        console.error('❌ Wallet list response invalid:', response);
        this.errorMessage = response?.message || 'Failed to load wallets';
        this.wallets = [];
      }
    } catch (error: any) {
      console.error('Failed to load wallets:', error);
      // Don't show error for wallet list - might be that backend doesn't have this endpoint yet
      this.wallets = [];
    } finally {
      this.loadingWallets = false;
    }
  }

  async refreshWalletList(): Promise<void> {
    await this.loadWalletList();
    this.successMessage = 'Wallet list refreshed';
  }

  async loadWalletStatistics(): Promise<void> {
    this.loadingStats = true;
    try {
      const response = await this.apiService.getWalletStatistics().toPromise();
      if (response?.success && response.data) {
        this.walletStats = response.data;
      }
    } catch (error: any) {
      console.error('Failed to load wallet statistics:', error);
      // Don't show error to user as this is supplementary data
    } finally {
      this.loadingStats = false;
    }
  }

  async syncAllBalances(): Promise<void> {
    this.syncingBalances = true;
    this.clearMessages();

    try {
      const response = await this.apiService.syncAllWalletBalances().toPromise();
      if (response?.success) {
        this.successMessage = `Synced balances for all wallets`;
        await this.loadWalletList();
        await this.loadWalletStatistics();
      } else {
        this.errorMessage = response?.message || 'Failed to sync balances';
      }
    } catch (error: any) {
      console.error('Failed to sync wallet balances:', error);
      this.errorMessage = error?.error?.message || error?.message || 'Failed to sync balances';
    } finally {
      this.syncingBalances = false;
    }
  }

  async syncWalletBalance(address: string): Promise<void> {
    try {
      const response = await this.apiService.syncWalletBalance(address).toPromise();
      if (response?.success) {
        this.successMessage = `Synced balance for wallet ${address.slice(0, 10)}...`;
        await this.loadWalletList();
      } else {
        this.errorMessage = response?.message || 'Failed to sync wallet balance';
      }
    } catch (error: any) {
      console.error('Failed to sync wallet balance:', error);
      this.errorMessage = error?.error?.message || error?.message || 'Failed to sync balance';
    }
  }

  fundWallet(address: string): void {
    console.log('fundWallet called with address:', address);
    this.fundingAddress = address;
    this.showFundModal = true;
    console.log('fundingAddress set to:', this.fundingAddress);
  }

  async confirmFundWallet(): Promise<void> {
    console.log('confirmFundWallet called');
    console.log('fundingAddress:', this.fundingAddress);
    console.log('fundAmount:', this.fundAmount);
    
    if (!this.fundingAddress) {
      console.error('No funding address provided!');
      this.errorMessage = 'No wallet address selected for funding';
      return;
    }

    // Store the address and amount BEFORE starting funding
    const addressToFund = this.fundingAddress;
    const amountToFund = this.fundAmount;

    // Set loading state BEFORE closing modal so user sees the loader
    this.fundingWallet = this.fundingAddress;
    
    try {
      // Keep modal open during funding to show loading state
      await this.fundWalletByAddress(addressToFund, amountToFund);
      // Close modal only after successful funding
      this.closeFundModal();
    } catch (error) {
      // Keep modal open on error so user can retry
      console.error('Funding failed, keeping modal open for retry');
    } finally {
      this.fundingWallet = null;
    }
  }

  private async fundWalletByAddress(address: string, amount: number): Promise<void> {
    console.log(`🚀 Starting funding process for ${address} with ${amount} XRP`);
    
    try {
      const request: FundWalletRequest = { address, amount };
      console.log('💳 Sending funding request:', request);
      console.log('🎯 Request details:', { address, amount, requestObject: request });
      
      // Clear any previous messages
      this.clearMessages();
      console.log('⏳ Calling fund wallet API...');
      
      const response = await this.apiService.fundWallet(request).toPromise();
      console.log('📡 Fund wallet API response:', response);
      
      if (response?.success) {
        console.log('✅ Funding successful!');
        this.successMessage = `Successfully funded wallet with ${amount} XRP`;
        
        // If the API returns different address (testnet faucet behavior)
        if (response.data?.actualAddress && response.data.actualAddress !== address) {
          this.successMessage += `\n⚠️ Note: Testnet faucet created new address: ${response.data.actualAddress}`;
          this.successMessage += `\n🔑 New wallet seed: ${response.data.seed}`;
          this.successMessage += `\n📝 ${response.data.note}`;
        }
        
        console.log('🔄 Refreshing wallet list to show updated balance...');
        await this.loadWalletList(); // Refresh to show new balance
        console.log('✅ Wallet list refreshed');
        
        // Success: no error thrown, modal will be closed by confirmFundWallet
      } else {
        console.error('❌ Funding failed - API returned unsuccessful response');
        this.errorMessage = response?.message || 'Failed to fund wallet - no success response';
        // Error: throw to prevent modal from closing
        throw new Error(this.errorMessage);
      }
    } catch (error: any) {
      console.error('💥 Fund wallet API call failed:', error);
      console.error('🔍 Error details:', {
        error: error,
        errorMessage: error?.message,
        errorBody: error?.error,
        status: error?.status,
        statusText: error?.statusText
      });
      
      // Extract meaningful error message
      let errorMsg = 'Failed to fund wallet - unknown error';
      if (error?.error?.error) {
        errorMsg = error.error.error;
      } else if (error?.error?.message) {
        errorMsg = error.error.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.status === 0) {
        errorMsg = 'Cannot connect to server - please check if the backend is running';
      } else if (error?.status === 404) {
        errorMsg = 'Fund wallet endpoint not found - please check API configuration';
      } else if (error?.status >= 500) {
        errorMsg = 'Server error occurred while funding wallet';
      }
      
      this.errorMessage = errorMsg;
      console.error('🚨 Final error message:', errorMsg);
      
      // Re-throw to prevent modal from closing
      throw error;
    }
  }

  closeFundModal(): void {
    this.showFundModal = false;
    this.fundingAddress = '';
    this.fundAmount = 1000;
  }

  connectToWallet(address: string): void {
    // Navigate to XRPL connect page with this address
    window.open(`/xrpl-connect?address=${address}`, '_blank');
  }

  connectToNewWallet(): void {
    if (this.newlyCreatedWallet) {
      this.connectToWallet(this.newlyCreatedWallet.address);
    }
  }

  viewWalletDetails(address: string): void {
    // Navigate to wallet details or open in new tab
    window.open(`/xrpl-connect?address=${address}`, '_blank');
  }

  togglePrivateKeyVisibility(): void {
    this.hidePrivateKey = !this.hidePrivateKey;
  }

  toggleSeedVisibility(): void {
    this.hideSeed = !this.hideSeed;
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.successMessage = 'Copied to clipboard!';
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.errorMessage = 'Failed to copy to clipboard';
    }
  }

  clearNewWalletInfo(): void {
    this.newlyCreatedWallet = null;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  clearError(): void {
    this.errorMessage = '';
  }

  clearSuccess(): void {
    this.successMessage = '';
  }

  getFormattedDescription(description?: string): string {
    if (!description) return '';
    
    try {
      // Try to parse as JSON and format nicely
      const parsed = JSON.parse(description);
      if (parsed.source === 'api_generated') {
        const date = new Date(parsed.createdAt).toLocaleDateString();
        return `API generated wallet (${date})`;
      }
      return description;
    } catch {
      // If not JSON, return as-is
      return description;
    }
  }

  /**
   * Process NFT count from various API response formats
   * @param nftData - Can be a number, array, or object with count property
   * @returns The NFT count as a number
   */
  processNftCount(nftData: any): number {
    console.log('Processing NFT data:', nftData, 'Type:', typeof nftData);
    
    // If it's already a number, return it
    if (typeof nftData === 'number') {
      console.log('NFT data is number:', nftData);
      return nftData;
    }
    
    // If it's an array, return the length
    if (Array.isArray(nftData)) {
      console.log('NFT data is array, length:', nftData.length);
      return nftData.length;
    }
    
    // If it's an object with owned/issued structure (new API format)
    if (nftData && typeof nftData === 'object' && ('owned' in nftData || 'issued' in nftData)) {
      const owned = nftData.owned || 0;
      const issued = nftData.issued || 0;
      const total = owned + issued;
      console.log('NFT data is object with owned/issued:', { owned, issued, total });
      return total;
    }
    
    // If it's an object with a count property
    if (nftData && typeof nftData === 'object' && 'count' in nftData) {
      console.log('NFT data is object with count:', nftData.count);
      return nftData.count;
    }
    
    // If it's an object with a length property
    if (nftData && typeof nftData === 'object' && 'length' in nftData) {
      console.log('NFT data is object with length:', nftData.length);
      return nftData.length;
    }
    
    // If it's a string that might be "[object Object]", try to parse it
    if (typeof nftData === 'string') {
      console.log('NFT data is string:', nftData);
      try {
        const parsed = JSON.parse(nftData);
        return this.processNftCount(parsed); // Recursively process the parsed object
      } catch {
        // If it's not valid JSON, see if it's a number string
        const numValue = parseInt(nftData, 10);
        if (!isNaN(numValue)) {
          console.log('NFT data is number string:', numValue);
          return numValue;
        }
      }
    }
    
    // Log unhandled cases
    console.log('NFT data unhandled, defaulting to 0:', nftData);
    
    // Default to 0
    return 0;
  }

  /**
   * Get display text for NFT count
   * @param nftCount - The NFT count object with owned and issued counts
   * @returns User-friendly display text
   */
  getNftDisplayText(nftCount: {owned: number; issued: number}): string {
    const owned = nftCount?.owned || 0;
    const issued = nftCount?.issued || 0;
    const total = owned + issued;
    
    if (owned > 0 && issued > 0) {
      return `${total} NFTs (${owned} owned, ${issued} issued)`;
    } else if (owned > 0) {
      return `${owned} NFT${owned === 1 ? '' : 's'} owned`;
    } else if (issued > 0) {
      return `${issued} NFT${issued === 1 ? '' : 's'} issued`;
    } else {
      return '0 NFTs';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getWalletDisplayName(wallet: WalletDisplay): string {
    if (wallet.nickname && wallet.nickname !== 'Unnamed Wallet') {
      return wallet.nickname;
    }
    return `Wallet ${wallet.address.slice(0, 8)}...`;
  }

  formatBalance(balance?: string): string {
    if (!balance || balance === '0') {
      return '0 XRP';
    }
    
    try {
      const numBalance = parseFloat(balance);
      if (isNaN(numBalance)) {
        return '0 XRP';
      }
      
      // Format large numbers with commas
      return `${numBalance.toLocaleString()} XRP`;
    } catch {
      return balance + ' XRP';
    }
  }
}
