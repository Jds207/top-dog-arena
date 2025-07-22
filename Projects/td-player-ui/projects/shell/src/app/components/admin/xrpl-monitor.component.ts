import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Transaction {
  hash: string;
  type: string;
  account: string;
  fee: string;
  sequence: number;
  timestamp: string;
  validated: boolean;
}

@Component({
  selector: 'app-xrpl-monitor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="xrpl-monitor">
      <header class="page-header">
        <h1>🔗 XRPL Network Monitor</h1>
        <button routerLink="/admin" class="back-btn">← Back to Dashboard</button>
      </header>

      <div class="monitor-content">
        <!-- Network Status -->
        <div class="status-section">
          <h2>Network Status</h2>
          <div class="status-grid">
            <div class="status-card">
              <div class="status-indicator online"></div>
              <div class="status-info">
                <h3>Songbird Testnet</h3>
                <p>Connected & Synchronized</p>
                <small>Last Update: {{ now | date:'short' }}</small>
              </div>
            </div>

            <div class="status-card">
              <div class="status-indicator online"></div>
              <div class="status-info">
                <h3>API Server</h3>
                <p>Operational</p>
                <small>Response Time: ~45ms</small>
              </div>
            </div>

            <div class="status-card">
              <div class="status-indicator online"></div>
              <div class="status-info">
                <h3>NFT Service</h3>
                <p>Ready for Minting</p>
                <small>Queue: 0 pending</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-section">
          <div class="section-header">
            <h2>Recent NFT Transactions</h2>
            <div class="controls">
              <button (click)="refreshTransactions()" class="refresh-btn" [disabled]="loading">
                {{ loading ? '⟳' : '🔄' }} Refresh
              </button>
              <button (click)="toggleAutoRefresh()" 
                      class="auto-refresh-btn" 
                      [class.active]="autoRefresh">
                {{ autoRefresh ? '⏸️' : '▶️' }} Auto Refresh
              </button>
            </div>
          </div>

          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
            <span>Loading transactions...</span>
          </div>

          <div *ngIf="!loading" class="transactions-table">
            <div class="table-header">
              <div class="header-cell">Transaction Hash</div>
              <div class="header-cell">Type</div>
              <div class="header-cell">Account</div>
              <div class="header-cell">Fee (SGB)</div>
              <div class="header-cell">Status</div>
              <div class="header-cell">Time</div>
            </div>

            <div *ngFor="let tx of mockTransactions; trackBy: trackByHash" class="transaction-row">
              <div class="cell">
                <code class="hash">{{ tx.hash | slice:0:20 }}...</code>
              </div>
              <div class="cell">
                <span class="type-badge" [class]="tx.type.toLowerCase()">{{ tx.type }}</span>
              </div>
              <div class="cell">
                <code class="account">{{ tx.account | slice:0:15 }}...</code>
              </div>
              <div class="cell">{{ tx.fee }}</div>
              <div class="cell">
                <span class="status-badge" [class.validated]="tx.validated">
                  {{ tx.validated ? '✅ Validated' : '⏳ Pending' }}
                </span>
              </div>
              <div class="cell">{{ tx.timestamp | date:'short' }}</div>
            </div>

            <div *ngIf="mockTransactions.length === 0" class="no-transactions">
              <p>No recent NFT transactions found.</p>
            </div>
          </div>
        </div>

        <!-- Network Stats -->
        <div class="stats-section">
          <h2>Network Statistics</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ totalNFTs }}</div>
              <div class="stat-label">Total NFTs Minted</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ todayNFTs }}</div>
              <div class="stat-label">Today's Mints</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ activeAccounts }}</div>
              <div class="stat-label">Active Accounts</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ networkFee }} SGB</div>
              <div class="stat-label">Avg Network Fee</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="actions-section">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button routerLink="/admin/nft-management" class="action-card">
              <div class="action-icon">🎴</div>
              <div class="action-title">Mint NFT</div>
              <div class="action-desc">Create new NFT on XRPL</div>
            </button>

            <button routerLink="/admin/api-tester" class="action-card">
              <div class="action-icon">🔧</div>
              <div class="action-title">Test API</div>
              <div class="action-desc">Interactive API testing</div>
            </button>

            <button (click)="openBlockchainExplorer()" class="action-card">
              <div class="action-icon">🌐</div>
              <div class="action-title">Explorer</div>
              <div class="action-desc">View on blockchain</div>
            </button>

            <button (click)="exportLogs()" class="action-card">
              <div class="action-icon">📊</div>
              <div class="action-title">Export Logs</div>
              <div class="action-desc">Download transaction logs</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .xrpl-monitor {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 2rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .back-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
    }

    .monitor-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      gap: 2rem;
    }

    .status-section,
    .transactions-section,
    .stats-section,
    .actions-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
    }

    .status-section h2,
    .transactions-section h2,
    .stats-section h2,
    .actions-section h2 {
      margin: 0 0 1.5rem 0;
      color: #fbbf24;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .status-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem;
      border-radius: 8px;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #ef4444;
    }

    .status-indicator.online {
      background: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    .status-info h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
    }

    .status-info p {
      margin: 0 0 0.25rem 0;
      font-size: 0.85rem;
      opacity: 0.8;
    }

    .status-info small {
      opacity: 0.6;
      font-size: 0.75rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .controls {
      display: flex;
      gap: 0.5rem;
    }

    .refresh-btn,
    .auto-refresh-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .refresh-btn {
      background: linear-gradient(45deg, #10b981, #059669);
      color: white;
    }

    .refresh-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auto-refresh-btn {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .auto-refresh-btn.active {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .transactions-table {
      overflow-x: auto;
    }

    .table-header,
    .transaction-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1.5fr 0.8fr 1fr 1fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .table-header {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px 4px 0 0;
      font-weight: bold;
    }

    .transaction-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .cell {
      display: flex;
      align-items: center;
    }

    .hash,
    .account {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
    }

    .type-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .type-badge.nfttokenmint {
      background: #10b981;
      color: white;
    }

    .type-badge.payment {
      background: #3b82f6;
      color: white;
    }

    .status-badge {
      font-size: 0.8rem;
    }

    .status-badge.validated {
      color: #4ade80;
    }

    .no-transactions {
      text-align: center;
      padding: 3rem;
      opacity: 0.6;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      background: rgba(255, 255, 255, 0.05);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #fbbf24;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .action-card:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .action-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .action-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #fbbf24;
    }

    .action-desc {
      font-size: 0.85rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .table-header,
      .transaction-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
      
      .controls {
        align-self: stretch;
      }
      
      .refresh-btn,
      .auto-refresh-btn {
        flex: 1;
      }
    }
  `]
})
export class XrplMonitorComponent implements OnInit {
  loading = false;
  autoRefresh = false;
  now = new Date();
  
  totalNFTs = 1247;
  todayNFTs = 23;
  activeAccounts = 156;
  networkFee = 0.00012;

  mockTransactions: Transaction[] = [
    {
      hash: 'E3FE6EA3D48F0C2B89F7BDD4F2C47ED2C7C8CC74E47A6EF0F13D4B6E7A8B9C0D',
      type: 'NFTTokenMint',
      account: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
      fee: '0.000012',
      sequence: 1234567,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      validated: true
    },
    {
      hash: 'F4GH7FB4E59G1D3C8AF8CEE5G3D58FE3D8D9DD85F58B7FG1G24E5C7F8B9A1E',
      type: 'NFTTokenMint',
      account: 'rP8p8puRbf7GdHFgMeTrtdtAVYElw7gzSI',
      fee: '0.000012',
      sequence: 1234568,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      validated: true
    },
    {
      hash: 'G5HI8GC5F6AH2E4D9BG9DFF6H4E69GF4E9EAEE96G69C8HG2G35F6D8G9CAIBF',
      type: 'Payment',
      account: 'rQ9q9qvScg8HeIgNfUusueubBWFmx8hzTJ',
      fee: '0.000010',
      sequence: 1234569,
      timestamp: new Date(Date.now() - 900000).toISOString(),
      validated: false
    }
  ];

  private refreshInterval: any;

  ngOnInit() {
    this.updateTime();
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshTransactions(): void {
    this.loading = true;
    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.updateTime();
      // In real app, would fetch new transactions
    }, 1500);
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
    
    if (this.autoRefresh) {
      this.refreshInterval = setInterval(() => {
        this.refreshTransactions();
      }, 10000); // Refresh every 10 seconds
    } else {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    }
  }

  updateTime(): void {
    this.now = new Date();
  }

  trackByHash(index: number, tx: Transaction): string {
    return tx.hash;
  }

  openBlockchainExplorer(): void {
    // In real app, would open actual blockchain explorer
    window.open('https://songbird-explorer.flare.network/', '_blank');
  }

  exportLogs(): void {
    // Mock log export functionality
    const logs = {
      timestamp: new Date().toISOString(),
      transactions: this.mockTransactions,
      stats: {
        totalNFTs: this.totalNFTs,
        todayNFTs: this.todayNFTs,
        activeAccounts: this.activeAccounts,
        networkFee: this.networkFee
      }
    };
    
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xrpl-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
