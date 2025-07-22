import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

interface XRPLAccount {
  address: string;
  balance: string;
  sequence: number;
  ownerReserve: string;
  reserve: string;
  nfts?: any[];
}

interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  method: 'manual' | 'xumm' | 'metamask' | null;
}

@Component({
  selector: 'app-xrpl-connect',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="xrpl-connect">
      <div class="connect-container">
        <!-- Header -->
        <div class="page-header">
          <h1>🔗 Connect to XRPL</h1>
          <p>Connect your wallet to interact with the XRP Ledger on Songbird Testnet</p>
        </div>

        <!-- Connection Status -->
        <div class="connection-status" [class.connected]="wallet.isConnected">
          <div class="status-indicator">
            <div class="indicator-dot" [class.active]="wallet.isConnected"></div>
            <span class="status-text">
              {{ wallet.isConnected ? '🟢 Connected to XRPL' : '🔴 Not Connected' }}
            </span>
          </div>
          <div *ngIf="wallet.isConnected" class="connection-info">
            <p><strong>Address:</strong> <code>{{ wallet.address }}</code></p>
            <p><strong>Balance:</strong> {{ wallet.balance }} XRP</p>
            <p><strong>Connection Method:</strong> {{ getMethodDisplay(wallet.method) }}</p>
          </div>
        </div>

        <!-- Backend Status -->
        <div class="backend-status" [class]="'status-' + backendStatus">
          <div class="status-indicator">
            <div class="indicator-dot" [class.active]="backendStatus === 'online'"></div>
            <span class="status-text">
              {{ backendStatus === 'checking' ? '🔄 Checking Backend...' : 
                 backendStatus === 'online' ? '🟢 Backend API Online' : '🔴 Backend API Offline' }}
            </span>
          </div>
          <div *ngIf="backendStatus === 'offline'" class="backend-info">
            <p><strong>⚠️ Backend Not Running:</strong> Using mock data for demonstration</p>
            <p>To enable full functionality, start the backend server:</p>
            <code>cd backend && npm run dev</code>
          </div>
          <div *ngIf="backendStatus === 'online'" class="backend-info">
            <p><strong>✅ Full API functionality available</strong></p>
          </div>
        </div>

        <!-- Connection Methods -->
        <div *ngIf="!wallet.isConnected" class="connection-methods">
          <h2>Choose Connection Method</h2>
          
          <!-- Manual Address Entry -->
          <div class="method-card">
            <div class="method-header">
              <h3>📝 Manual Address Entry</h3>
              <p>Enter an XRPL address to view account information</p>
            </div>
            <div class="method-form">
              <input 
                [(ngModel)]="manualAddress" 
                type="text" 
                placeholder="rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
                class="address-input"
                [class.error]="addressError"
              >
              <button 
                (click)="connectManual()" 
                [disabled]="!manualAddress || connecting" 
                class="connect-btn manual"
              >
                {{ connecting ? 'Connecting...' : 'Connect' }}
              </button>
            </div>
            <div *ngIf="addressError" class="error-message">
              {{ addressError }}
            </div>
            <div class="method-info">
              <small>
                💡 You can use any valid XRPL address. For testing, try: 
                <code (click)="useTestAddress('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH')">rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH</code>
              </small>
            </div>
          </div>

          <!-- Xumm Wallet (Coming Soon) -->
          <div class="method-card disabled">
            <div class="method-header">
              <h3>📱 Xumm Wallet</h3>
              <p>Connect using the Xumm mobile wallet (Coming Soon)</p>
            </div>
            <button class="connect-btn xumm" disabled>
              Coming Soon
            </button>
          </div>

          <!-- MetaMask (Coming Soon) -->
          <div class="method-card disabled">
            <div class="method-header">
              <h3>🦊 MetaMask</h3>
              <p>Connect using MetaMask for Flare Network (Coming Soon)</p>
            </div>
            <button class="connect-btn metamask" disabled>
              Coming Soon
            </button>
          </div>
        </div>

        <!-- Account Information -->
        <div *ngIf="wallet.isConnected && accountInfo" class="account-info">
          <h2>Account Information</h2>
          <div class="info-grid">
            <div class="info-card">
              <h3>Balance</h3>
              <div class="balance-display">
                <span class="balance-amount">{{ accountInfo.balance }}</span>
                <span class="balance-currency">XRP</span>
              </div>
            </div>

            <div class="info-card">
              <h3>Sequence Number</h3>
              <div class="sequence-display">{{ accountInfo.sequence || 'N/A' }}</div>
            </div>

            <div class="info-card">
              <h3>Reserve</h3>
              <div class="reserve-display">{{ accountInfo.reserve || 'N/A' }} XRP</div>
            </div>

            <div class="info-card">
              <h3>Owner Reserve</h3>
              <div class="owner-reserve-display">{{ accountInfo.ownerReserve || 'N/A' }} XRP</div>
            </div>
          </div>

          <!-- NFT Section -->
          <div class="nft-section">
            <h3>NFTs Owned</h3>
            <div class="nft-actions">
              <button (click)="loadNFTs()" [disabled]="loadingNFTs" class="load-nfts-btn">
                {{ loadingNFTs ? '⏳ Loading...' : '🎴 Load NFTs' }}
              </button>
              <span class="nft-count">{{ nfts.length }} NFTs found</span>
            </div>

            <div *ngIf="nfts.length > 0" class="nfts-grid">
              <div *ngFor="let nft of nfts" class="nft-card">
                <div class="nft-image" *ngIf="nft.image">
                  <img [src]="nft.image" [alt]="nft.name" />
                </div>
                <div class="nft-info">
                  <h4>{{ nft.name || 'Unnamed NFT' }}</h4>
                  <p>{{ nft.description || 'No description' }}</p>
                  <div class="nft-meta">
                    <small>Token ID: {{ nft.tokenId || nft.id }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="!loadingNFTs && nfts.length === 0 && nftsLoaded" class="no-nfts">
              <p>No NFTs found for this address.</p>
              <p>
                <a routerLink="/admin/nft-management">Mint your first NFT →</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div *ngIf="wallet.isConnected" class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button routerLink="/admin/nft-management" class="action-btn mint">
              🎨 Mint NFT
            </button>
            <button (click)="refreshAccount()" class="action-btn refresh" [disabled]="refreshing">
              {{ refreshing ? '⏳' : '🔄' }} Refresh
            </button>
            <button (click)="disconnect()" class="action-btn disconnect">
              🔌 Disconnect
            </button>
            <button routerLink="/xrpl-test" class="action-btn test">
              🔧 Test Connection
            </button>
          </div>
        </div>

        <!-- Network Information -->
        <div class="network-info">
          <h2>Network Information</h2>
          <div class="network-details">
            <div class="network-item">
              <label>Network:</label>
              <span>Songbird Testnet</span>
            </div>
            <div class="network-item">
              <label>RPC Endpoint:</label>
              <span><code>wss://songbird-rpc.flare.network/</code></span>
            </div>
            <div class="network-item">
              <label>Chain ID:</label>
              <span>19 (Songbird)</span>
            </div>
            <div class="network-item">
              <label>Explorer:</label>
              <a href="https://songbird-explorer.flare.network/" target="_blank" rel="noopener">
                View on Explorer ↗
              </a>
            </div>
          </div>
        </div>

        <!-- Connection Tips -->
        <div class="connection-tips">
          <h2>Connection Tips</h2>
          <div class="tips-list">
            <div class="tip-item">
              <span class="tip-icon">💡</span>
              <div class="tip-content">
                <strong>Manual Connection:</strong> Enter any valid XRPL address to view account information and NFTs.
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔒</span>
              <div class="tip-content">
                <strong>Read-Only:</strong> Manual connection provides read-only access. No private keys are stored or required.
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🧪</span>
              <div class="tip-content">
                <strong>Testnet:</strong> This interface connects to Songbird Testnet for safe testing.
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🎯</span>
              <div class="tip-content">
                <strong>NFT Minting:</strong> Use the admin panel to mint NFTs that will appear in connected wallets.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .xrpl-connect {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      color: white;
      padding: 2rem;
    }

    .connect-container {
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

    .connection-status {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(239, 68, 68, 0.5);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 3rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .connection-status.connected {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.1);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .indicator-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #ef4444;
      transition: all 0.3s ease;
    }

    .indicator-dot.active {
      background: #22c55e;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
    }

    .status-text {
      font-size: 1.2rem;
      font-weight: bold;
    }

    .connection-info {
      text-align: left;
      margin-top: 1rem;
    }

    .connection-info p {
      margin: 0.5rem 0;
    }

    .connection-info code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    .backend-status {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(59, 130, 246, 0.5);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 3rem;
      text-align: center;
      transition: all 0.3s ease;
    }

    .backend-status.status-online {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.1);
    }

    .backend-status.status-offline {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.1);
    }

    .backend-status.status-checking {
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(59, 130, 246, 0.1);
    }

    .backend-info {
      text-align: left;
      margin-top: 1rem;
    }

    .backend-info p {
      margin: 0.5rem 0;
    }

    .backend-info code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-size: 0.9rem;
      display: block;
      margin-top: 0.5rem;
      font-family: 'Courier New', monospace;
    }

    .connection-methods {
      margin-bottom: 3rem;
    }

    .connection-methods h2 {
      text-align: center;
      margin: 0 0 2rem 0;
      color: #fbbf24;
    }

    .method-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 1.5rem;
      transition: all 0.3s ease;
    }

    .method-card:hover:not(.disabled) {
      transform: translateY(-2px);
      border-color: rgba(251, 191, 36, 0.5);
    }

    .method-card.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .method-header h3 {
      margin: 0 0 0.5rem 0;
      color: #fbbf24;
    }

    .method-header p {
      margin: 0 0 1.5rem 0;
      opacity: 0.8;
    }

    .method-form {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .address-input {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .address-input:focus {
      outline: none;
      border-color: #fbbf24;
    }

    .address-input.error {
      border-color: #ef4444;
    }

    .address-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .connect-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
    }

    .connect-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .connect-btn.manual {
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
    }

    .connect-btn.manual:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .connect-btn.xumm {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      color: white;
    }

    .connect-btn.metamask {
      background: linear-gradient(45deg, #f59e0b, #d97706);
      color: white;
    }

    .error-message {
      color: #f87171;
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }

    .method-info {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .method-info code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .method-info code:hover {
      background: rgba(251, 191, 36, 0.2);
    }

    .account-info,
    .quick-actions,
    .network-info,
    .connection-tips {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .account-info h2,
    .quick-actions h2,
    .network-info h2,
    .connection-tips h2 {
      margin: 0 0 1.5rem 0;
      color: #fbbf24;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }

    .info-card h3 {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .balance-amount {
      font-size: 2rem;
      font-weight: bold;
      color: #10b981;
    }

    .balance-currency {
      font-size: 1rem;
      opacity: 0.8;
      margin-left: 0.5rem;
    }

    .sequence-display,
    .reserve-display,
    .owner-reserve-display {
      font-size: 1.5rem;
      font-weight: bold;
      color: #fbbf24;
    }

    .nft-section {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
      margin-top: 2rem;
    }

    .nft-section h3 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .nft-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .load-nfts-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .load-nfts-btn:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    .load-nfts-btn:disabled {
      opacity: 0.6;
    }

    .nft-count {
      opacity: 0.8;
    }

    .nfts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .nft-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s ease;
    }

    .nft-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.1);
    }

    .nft-image {
      width: 100%;
      height: 150px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .nft-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .nft-info h4 {
      margin: 0 0 0.5rem 0;
      color: #fbbf24;
    }

    .nft-info p {
      margin: 0 0 1rem 0;
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
    }

    .nft-meta small {
      opacity: 0.6;
      font-size: 0.8rem;
    }

    .no-nfts {
      text-align: center;
      padding: 3rem;
      opacity: 0.6;
    }

    .no-nfts a {
      color: #10b981;
      text-decoration: none;
      font-weight: bold;
    }

    .no-nfts a:hover {
      text-decoration: underline;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      padding: 0.75rem 1rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn.mint {
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
    }

    .action-btn.refresh {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      color: white;
    }

    .action-btn.disconnect {
      background: linear-gradient(45deg, #ef4444, #dc2626);
      color: white;
    }

    .action-btn.test {
      background: linear-gradient(45deg, #8b5cf6, #7c3aed);
      color: white;
    }

    .action-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .action-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .network-details {
      display: grid;
      gap: 1rem;
    }

    .network-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .network-item:last-child {
      border-bottom: none;
    }

    .network-item label {
      font-weight: bold;
      opacity: 0.8;
    }

    .network-item code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .network-item a {
      color: #10b981;
      text-decoration: none;
    }

    .network-item a:hover {
      text-decoration: underline;
    }

    .tips-list {
      display: grid;
      gap: 1rem;
    }

    .tip-item {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .tip-icon {
      font-size: 1.2rem;
      margin-top: 0.2rem;
    }

    .tip-content strong {
      color: #fbbf24;
    }

    @media (max-width: 768px) {
      .method-form {
        flex-direction: column;
      }

      .connect-btn {
        width: 100%;
      }

      .info-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .nfts-grid {
        grid-template-columns: 1fr;
      }

      .nft-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .load-nfts-btn {
        width: 100%;
      }
    }
  `]
})
export class XrplConnectComponent implements OnInit, OnDestroy {
  wallet: WalletConnection = {
    isConnected: false,
    address: null,
    balance: null,
    method: null
  };

  manualAddress = '';
  addressError = '';
  connecting = false;
  refreshing = false;
  backendStatus: 'checking' | 'online' | 'offline' = 'checking';

  accountInfo: XRPLAccount | null = null;
  nfts: any[] = [];
  loadingNFTs = false;
  nftsLoaded = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // Check backend status
    this.checkBackendStatus();
    
    // Check if there's a saved connection
    const savedConnection = this.getSavedConnection();
    if (savedConnection) {
      this.wallet = savedConnection;
      this.loadAccountInfo();
    }
  }

  ngOnDestroy() {
    // Save connection state
    this.saveConnection();
  }

  async checkBackendStatus(): Promise<void> {
    try {
      await this.apiService.checkAPIHealth().toPromise();
      this.backendStatus = 'online';
    } catch (error) {
      this.backendStatus = 'offline';
      console.warn('Backend API is not available:', error);
    }
  }

  useTestAddress(address: string): void {
    this.manualAddress = address;
    this.addressError = '';
  }

  async connectManual(): Promise<void> {
    if (!this.manualAddress) return;

    this.connecting = true;
    this.addressError = '';

    try {
      // Basic XRPL address validation
      if (!this.isValidXRPLAddress(this.manualAddress)) {
        throw new Error('Invalid XRPL address format');
      }

      // Try to get account info from our API
      const accountData = await this.getAccountInfo(this.manualAddress);
      
      this.wallet = {
        isConnected: true,
        address: this.manualAddress,
        balance: accountData?.balance || '0',
        method: 'manual'
      };

      this.accountInfo = accountData;
      this.saveConnection();

    } catch (error: any) {
      this.addressError = error.message || 'Failed to connect to address';
      console.error('Connection error:', error);
    } finally {
      this.connecting = false;
    }
  }

  async refreshAccount(): Promise<void> {
    if (!this.wallet.address) return;

    this.refreshing = true;
    try {
      const accountData = await this.getAccountInfo(this.wallet.address);
      this.accountInfo = accountData;
      this.wallet.balance = accountData?.balance || '0';
      
      // Refresh NFTs if they were previously loaded
      if (this.nftsLoaded) {
        await this.loadNFTs();
      }
    } catch (error) {
      console.error('Failed to refresh account:', error);
    } finally {
      this.refreshing = false;
    }
  }

  async loadNFTs(): Promise<void> {
    if (!this.wallet.address) return;

    this.loadingNFTs = true;
    try {
      const response = await this.apiService.getAccountNFTs(this.wallet.address).toPromise();
      if (response?.success && response.data) {
        // Transform the XRPL NFT format to our display format
        this.nfts = response.data.nfts.map(nft => ({
          id: nft.NFTokenID,
          name: `NFT #${nft.nft_serial}`,
          description: `NFT from ${nft.Issuer}`,
          tokenId: nft.NFTokenID,
          image: nft.URI ? this.decodeHexURI(nft.URI) : undefined,
          attributes: [
            { trait_type: 'Serial', value: nft.nft_serial.toString() },
            { trait_type: 'Taxon', value: nft.NFTokenTaxon.toString() },
            { trait_type: 'Transfer Fee', value: `${nft.TransferFee / 1000}%` }
          ]
        }));
      } else {
        this.nfts = [];
      }
      this.nftsLoaded = true;
    } catch (error) {
      console.error('Failed to load NFTs:', error);
      this.nfts = [];
    } finally {
      this.loadingNFTs = false;
    }
  }

  private decodeHexURI(hexString: string): string {
    try {
      // Remove '0x' prefix if present
      const cleanHex = hexString.replace(/^0x/, '');
      // Convert hex to string
      let result = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        result += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
      return result;
    } catch (error) {
      console.warn('Failed to decode hex URI:', hexString, error);
      return '';
    }
  }

  disconnect(): void {
    this.wallet = {
      isConnected: false,
      address: null,
      balance: null,
      method: null
    };
    this.accountInfo = null;
    this.nfts = [];
    this.nftsLoaded = false;
    this.manualAddress = '';
    this.addressError = '';
    this.clearSavedConnection();
  }

  private async getAccountInfo(address: string): Promise<XRPLAccount> {
    try {
      // Try to get wallet info first - this gives us network and balance information
      const walletInfo = await this.apiService.getWalletInfo().toPromise();
      
      if (walletInfo?.success && walletInfo.data) {
        const balance = walletInfo.data.balance;
        return {
          address: address,
          balance: balance ? (parseInt(balance.balance) / 1000000).toString() : '0', // Convert drops to XRP
          sequence: 0, // Not available from current API
          ownerReserve: '2', // Standard XRPL reserve
          reserve: '10' // Standard XRPL reserve
        };
      }
      
      throw new Error('No wallet info available');
    } catch (error) {
      console.warn('Backend API call failed, using mock data for demonstration:', error);
      
      // Mock data for demonstration when backend is not available
      return {
        address: address,
        balance: '100.50',
        sequence: 12345,
        ownerReserve: '10',
        reserve: '20'
      };
    }
  }

  private async loadAccountInfo(): Promise<void> {
    if (!this.wallet.address) return;

    try {
      const accountData = await this.getAccountInfo(this.wallet.address);
      this.accountInfo = accountData;
      this.wallet.balance = accountData.balance;
    } catch (error) {
      console.error('Failed to load account info:', error);
    }
  }

  private isValidXRPLAddress(address: string): boolean {
    // Basic XRPL address validation
    return /^r[a-zA-Z0-9]{24,34}$/.test(address);
  }

  private getSavedConnection(): WalletConnection | null {
    if (typeof localStorage === 'undefined') return null;
    
    const saved = localStorage.getItem('xrpl_connection');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Failed to parse saved connection:', error);
      }
    }
    return null;
  }

  private saveConnection(): void {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem('xrpl_connection', JSON.stringify(this.wallet));
  }

  private clearSavedConnection(): void {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.removeItem('xrpl_connection');
  }

  getMethodDisplay(method: string | null): string {
    switch (method) {
      case 'manual': return '📝 Manual Entry';
      case 'xumm': return '📱 Xumm Wallet';
      case 'metamask': return '🦊 MetaMask';
      default: return 'Unknown';
    }
  }
}
