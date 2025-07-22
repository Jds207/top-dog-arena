import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';

interface ConnectionStatus {
  api: 'online' | 'offline' | 'checking';
  xrpl: 'online' | 'offline' | 'checking';
  networkInfo?: any;
  lastCheck: Date;
  errors: string[];
}

@Component({
  selector: 'app-xrpl-connection-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connection-test">
      <div class="test-header">
        <h2>🔗 XRPL Connection Test</h2>
        <button (click)="runConnectionTest()" [disabled]="testing" class="test-btn">
          {{ testing ? 'Testing...' : 'Test Connection' }}
        </button>
      </div>

      <div class="status-grid">
        <!-- API Status -->
        <div class="status-card">
          <div class="status-header">
            <h3>Backend API</h3>
            <span class="status-indicator" [class]="status.api">
              {{ getStatusIcon(status.api) }}
            </span>
          </div>
          <div class="status-details">
            <p class="status-text">{{ getStatusText('api', status.api) }}</p>
            <small>http://localhost:3000/api</small>
          </div>
        </div>

        <!-- XRPL Status -->
        <div class="status-card">
          <div class="status-header">
            <h3>XRPL Network</h3>
            <span class="status-indicator" [class]="status.xrpl">
              {{ getStatusIcon(status.xrpl) }}
            </span>
          </div>
          <div class="status-details">
            <p class="status-text">{{ getStatusText('xrpl', status.xrpl) }}</p>
            <small>Songbird Testnet</small>
          </div>
        </div>
      </div>

      <!-- Network Information -->
      <div *ngIf="status.networkInfo" class="network-info">
        <h3>Network Information</h3>
        <div class="info-grid">
          <div class="info-item">
            <label>Network ID:</label>
            <span>{{ status.networkInfo.networkId || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Ledger Index:</label>
            <span>{{ status.networkInfo.ledgerIndex || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Server State:</label>
            <span>{{ status.networkInfo.serverState || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <label>Fee Base:</label>
            <span>{{ status.networkInfo.feeBase || 'N/A' }} drops</span>
          </div>
        </div>
      </div>

      <!-- Errors -->
      <div *ngIf="status.errors.length > 0" class="error-section">
        <h3>Connection Errors</h3>
        <div class="error-list">
          <div *ngFor="let error of status.errors" class="error-item">
            {{ error }}
          </div>
        </div>
      </div>

      <!-- Last Check -->
      <div class="last-check">
        <small>Last checked: {{ status.lastCheck | date:'medium' }}</small>
      </div>

      <!-- Quick Tests -->
      <div class="quick-tests">
        <h3>Quick Tests</h3>
        <div class="test-buttons">
          <button (click)="testAPIHealth()" class="quick-test-btn">
            Test API Health
          </button>
          <button (click)="testXRPLConnection()" class="quick-test-btn">
            Test XRPL Connection
          </button>
          <button (click)="getNetworkInfo()" class="quick-test-btn">
            Get Network Info
          </button>
        </div>
      </div>

      <!-- Manual Connection Test -->
      <div class="manual-test">
        <h3>Manual XRPL Test</h3>
        <p>You can also test XRPL connectivity directly:</p>
        <div class="code-block">
          <code>
            // Test with XRPL client directly<br>
            const xrpl = require('xrpl');<br>
            const client = new xrpl.Client('wss://songbird-rpc.flare.network/');<br>
            await client.connect();<br>
            console.log(client.isConnected());<br>
            await client.disconnect();
          </code>
        </div>
        <p><strong>Songbird Testnet RPC:</strong> wss://songbird-rpc.flare.network/</p>
        <p><strong>Alternative RPC:</strong> wss://songbird.evm.flare.network/ws</p>
      </div>
    </div>
  `,
  styles: [`
    .connection-test {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 12px;
      color: white;
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .test-header h2 {
      margin: 0;
      color: #fbbf24;
    }

    .test-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .test-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .test-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .status-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .status-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .status-indicator {
      font-size: 1.5rem;
    }

    .status-indicator.online {
      color: #10b981;
    }

    .status-indicator.offline {
      color: #ef4444;
    }

    .status-indicator.checking {
      color: #f59e0b;
    }

    .status-details small {
      opacity: 0.7;
      font-size: 0.8rem;
    }

    .status-text {
      margin: 0 0 0.5rem 0;
      font-weight: bold;
    }

    .network-info {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .network-info h3 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-item label {
      font-weight: bold;
      opacity: 0.8;
    }

    .error-section {
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .error-section h3 {
      margin: 0 0 1rem 0;
      color: #fca5a5;
    }

    .error-item {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.5rem;
      border-radius: 4px;
      margin-bottom: 0.5rem;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .last-check {
      text-align: center;
      opacity: 0.6;
      margin-bottom: 2rem;
    }

    .quick-tests {
      margin-bottom: 2rem;
    }

    .quick-tests h3 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .test-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quick-test-btn {
      padding: 0.5rem 1rem;
      background: rgba(59, 130, 246, 0.8);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-test-btn:hover {
      background: rgba(59, 130, 246, 1);
    }

    .manual-test {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .manual-test h3 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .manual-test p {
      margin: 1rem 0;
      line-height: 1.5;
    }

    .code-block {
      background: rgba(0, 0, 0, 0.5);
      padding: 1rem;
      border-radius: 4px;
      margin: 1rem 0;
      overflow-x: auto;
    }

    .code-block code {
      color: #10b981;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      line-height: 1.4;
    }

    @media (max-width: 768px) {
      .test-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
      
      .test-buttons {
        flex-direction: column;
      }
      
      .quick-test-btn {
        width: 100%;
      }
    }
  `]
})
export class XrplConnectionTestComponent implements OnInit {
  testing = false;
  
  status: ConnectionStatus = {
    api: 'checking',
    xrpl: 'checking',
    lastCheck: new Date(),
    errors: []
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.runConnectionTest();
  }

  async runConnectionTest(): Promise<void> {
    this.testing = true;
    this.status.errors = [];
    this.status.lastCheck = new Date();

    // Test API Health
    await this.testAPIHealth();
    
    // Test XRPL Connection
    await this.testXRPLConnection();
    
    // Get Network Info
    await this.getNetworkInfo();

    this.testing = false;
  }

  async testAPIHealth(): Promise<void> {
    try {
      this.status.api = 'checking';
      await this.apiService.checkAPIHealth().toPromise();
      this.status.api = 'online';
    } catch (error: any) {
      this.status.api = 'offline';
      this.status.errors.push(`API Health Check Failed: ${error.message}`);
    }
  }

  async testXRPLConnection(): Promise<void> {
    try {
      this.status.xrpl = 'checking';
      await this.apiService.checkXRPLConnection().toPromise();
      this.status.xrpl = 'online';
    } catch (error: any) {
      this.status.xrpl = 'offline';
      this.status.errors.push(`XRPL Connection Failed: ${error.message}`);
    }
  }

  async getNetworkInfo(): Promise<void> {
    try {
      const walletInfo = await this.apiService.getWalletInfo().toPromise();
      this.status.networkInfo = walletInfo?.data?.network || null;
    } catch (error: any) {
      this.status.errors.push(`Network Info Failed: ${error.message}`);
    }
  }

  getStatusIcon(status: 'online' | 'offline' | 'checking'): string {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  }

  getStatusText(type: string, status: 'online' | 'offline' | 'checking'): string {
    if (status === 'checking') return 'Checking connection...';
    
    if (type === 'api') {
      return status === 'online' ? 'API server is responding' : 'API server is not responding';
    } else {
      return status === 'online' ? 'XRPL network is connected' : 'Cannot connect to XRPL network';
    }
  }
}
