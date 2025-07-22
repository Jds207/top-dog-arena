import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface ApiEndpoint {
  name: string;
  method: string;
  endpoint: string;
  description: string;
  requiresAuth: boolean;
  samplePayload?: any;
}

@Component({
  selector: 'app-api-tester',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="api-tester">
      <header class="page-header">
        <h1>🔧 API Tester</h1>
        <button routerLink="/admin" class="back-btn">← Back to Dashboard</button>
      </header>

      <div class="api-content">
        <!-- Authentication Section -->
        <div class="auth-section">
          <h2>Authentication</h2>
          <div class="auth-form">
            <div class="form-row">
              <input 
                [(ngModel)]="authEmail" 
                type="email" 
                placeholder="Email"
                class="auth-input"
              >
              <input 
                [(ngModel)]="authPassword" 
                type="password" 
                placeholder="Password"
                class="auth-input"
              >
              <button (click)="login()" class="auth-btn">Login</button>
              <button (click)="register()" class="auth-btn register">Register</button>
            </div>
            <div class="auth-status">
              <span [class]="isAuthenticated ? 'authenticated' : 'not-authenticated'">
                {{ isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated' }}
              </span>
              <button *ngIf="isAuthenticated" (click)="logout()" class="logout-small">Logout</button>
            </div>
          </div>
        </div>

        <div class="api-sections">
          <!-- Quick Actions -->
          <div class="api-section">
            <h2>Quick Actions</h2>
            <div class="quick-actions">
              <button 
                *ngFor="let endpoint of quickEndpoints" 
                (click)="selectEndpoint(endpoint)"
                class="quick-action-btn"
                [class.selected]="selectedEndpoint === endpoint"
              >
                <span class="method-badge" [class]="endpoint.method.toLowerCase()">
                  {{ endpoint.method }}
                </span>
                {{ endpoint.name }}
              </button>
            </div>
          </div>

          <!-- API Request Form -->
          <div class="api-section">
            <h2>API Request</h2>
            <div class="request-form">
              <div class="form-group">
                <label>HTTP Method</label>
                <select [(ngModel)]="requestMethod" class="method-select">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div class="form-group">
                <label>Endpoint</label>
                <input 
                  [(ngModel)]="requestEndpoint" 
                  type="text" 
                  placeholder="/nft/mint"
                  class="endpoint-input"
                >
              </div>

              <div class="form-group">
                <label>Request Body (JSON)</label>
                <textarea 
                  [(ngModel)]="requestBody" 
                  rows="8"
                  placeholder='{"name": "Test NFT", "description": "A test NFT"}'
                  class="json-textarea"
                ></textarea>
              </div>

              <div class="form-actions">
                <button (click)="sendRequest()" [disabled]="!requestEndpoint" class="send-btn">
                  Send Request
                </button>
                <button (click)="clearRequest()" class="clear-btn">Clear</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Response Section -->
        <div class="response-section" *ngIf="lastResponse || lastError">
          <h2>Response</h2>
          
          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
            <span>Sending request...</span>
          </div>

          <div *ngIf="lastResponse && !loading" class="response-success">
            <div class="response-header">
              <span class="status-code success">{{ lastResponse.status || 200 }}</span>
              <span class="response-time">{{ lastResponse.time }}ms</span>
            </div>
            <pre class="response-body">{{ lastResponse.data | json }}</pre>
          </div>

          <div *ngIf="lastError && !loading" class="response-error">
            <div class="response-header">
              <span class="status-code error">{{ lastError.status || 'Error' }}</span>
            </div>
            <pre class="response-body">{{ lastError.message || lastError | json }}</pre>
          </div>
        </div>

        <!-- Sample Requests -->
        <div class="samples-section">
          <h2>Sample Requests</h2>
          <div class="samples-grid">
            <div *ngFor="let sample of sampleRequests" class="sample-card">
              <h3>{{ sample.title }}</h3>
              <p>{{ sample.description }}</p>
              <div class="sample-details">
                <span class="method-badge" [class]="sample.method.toLowerCase()">
                  {{ sample.method }}
                </span>
                <code>{{ sample.endpoint }}</code>
              </div>
              <button (click)="loadSample(sample)" class="load-sample-btn">
                Load Sample
              </button>
              <pre class="sample-body" *ngIf="sample.body">{{ sample.body | json }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-tester {
      min-height: 100vh;
      background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
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

    .api-content {
      max-width: 1400px;
      margin: 0 auto;
    }

    .auth-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .auth-section h2 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .auth-form .form-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .auth-input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .auth-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }

    .auth-btn.register {
      background: linear-gradient(45deg, #3b82f6, #2563eb);
    }

    .auth-status {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .authenticated {
      color: #4ade80;
    }

    .not-authenticated {
      color: #f87171;
    }

    .api-sections {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .api-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .api-section h2 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .quick-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }

    .quick-action-btn:hover,
    .quick-action-btn.selected {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .method-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .method-badge.get { background: #10b981; }
    .method-badge.post { background: #3b82f6; }
    .method-badge.put { background: #f59e0b; }
    .method-badge.delete { background: #ef4444; }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #e5e7eb;
      font-weight: bold;
    }

    .method-select,
    .endpoint-input,
    .json-textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-family: 'Courier New', monospace;
    }

    .json-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .form-actions {
      display: flex;
      gap: 0.5rem;
    }

    .send-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .clear-btn {
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      color: white;
      cursor: pointer;
    }

    .response-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .response-section h2 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      justify-content: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .response-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    .status-code {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-weight: bold;
    }

    .status-code.success {
      background: #10b981;
      color: white;
    }

    .status-code.error {
      background: #ef4444;
      color: white;
    }

    .response-time {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .response-body {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .samples-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .samples-section h2 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .samples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .sample-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
    }

    .sample-card h3 {
      margin: 0 0 0.5rem 0;
      color: #fbbf24;
    }

    .sample-card p {
      margin: 0 0 1rem 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .sample-details {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .sample-details code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
    }

    .load-sample-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(45deg, #3b82f6, #2563eb);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .sample-body {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      padding: 0.5rem;
      font-size: 0.75rem;
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .api-sections {
        grid-template-columns: 1fr;
      }
      
      .auth-form .form-row {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class ApiTesterComponent {
  authEmail = '';
  authPassword = '';
  isAuthenticated = false;

  requestMethod = 'POST';
  requestEndpoint = '/nft/mint';
  requestBody = '';

  lastResponse: any = null;
  lastError: any = null;
  loading = false;

  selectedEndpoint: ApiEndpoint | null = null;

  quickEndpoints: ApiEndpoint[] = [
    {
      name: 'Mint NFT',
      method: 'POST',
      endpoint: '/nft/mint',
      description: 'Create a new NFT on XRPL',
      requiresAuth: true,
      samplePayload: {
        name: 'Test Baseball Card',
        description: 'A legendary rookie card',
        image: 'https://example.com/card.png',
        attributes: [
          { trait_type: 'Rarity', value: 'Legendary' },
          { trait_type: 'Player', value: 'Mike Trout' },
          { trait_type: 'Year', value: '2023' }
        ]
      }
    },
    {
      name: 'Get NFT',
      method: 'GET',
      endpoint: '/nft/{tokenId}',
      description: 'Retrieve NFT details by token ID',
      requiresAuth: true
    },
    {
      name: 'Get Account NFTs',
      method: 'GET',
      endpoint: '/account/{address}/nfts',
      description: 'Get all NFTs for a wallet address',
      requiresAuth: true
    },
    {
      name: 'Register User',
      method: 'POST',
      endpoint: '/auth/register',
      description: 'Create a new user account',
      requiresAuth: false,
      samplePayload: {
        email: 'test@example.com',
        password: 'password123'
      }
    },
    {
      name: 'Login User',
      method: 'POST',
      endpoint: '/auth/login',
      description: 'Authenticate user and get JWT token',
      requiresAuth: false,
      samplePayload: {
        email: 'test@example.com',
        password: 'password123'
      }
    }
  ];

  sampleRequests = [
    {
      title: 'Mint Baseball Card NFT',
      description: 'Create a baseball trading card NFT with player stats',
      method: 'POST',
      endpoint: '/nft/mint',
      body: {
        name: 'Mike Trout Rookie Card #001',
        description: 'Ultra-rare rookie card featuring Mike Trout with holographic finish',
        image: 'https://example.com/trout-card.png',
        attributes: [
          { trait_type: 'Rarity', value: 'Ultra Rare' },
          { trait_type: 'Player', value: 'Mike Trout' },
          { trait_type: 'Position', value: 'Center Field' },
          { trait_type: 'Team', value: 'Los Angeles Angels' },
          { trait_type: 'Year', value: '2023' },
          { trait_type: 'Edition', value: 'Holographic' }
        ]
      }
    },
    {
      title: 'User Registration',
      description: 'Register a new admin user',
      method: 'POST',
      endpoint: '/auth/register',
      body: {
        email: 'admin@topdog.arena',
        password: 'SecurePassword123!'
      }
    },
    {
      title: 'Get NFT Details',
      description: 'Retrieve details of a specific NFT',
      method: 'GET',
      endpoint: '/nft/ABC123DEF456',
      body: null
    }
  ];

  constructor(private apiService: ApiService) {
    this.apiService.token$.subscribe(token => {
      this.isAuthenticated = !!token;
    });
  }

  selectEndpoint(endpoint: ApiEndpoint): void {
    this.selectedEndpoint = endpoint;
    this.requestMethod = endpoint.method;
    this.requestEndpoint = endpoint.endpoint;
    if (endpoint.samplePayload) {
      this.requestBody = JSON.stringify(endpoint.samplePayload, null, 2);
    } else {
      this.requestBody = '';
    }
  }

  login(): void {
    if (!this.authEmail || !this.authPassword) return;

    this.apiService.login(this.authEmail, this.authPassword).subscribe({
      next: (response) => {
        // Note: Login returns NotImplementedResponse (501), so no token is actually set
        this.lastResponse = { data: response, status: 200, time: Date.now() };
        this.lastError = null;
      },
      error: (error) => {
        this.lastError = error.error || error;
        this.lastResponse = null;
      }
    });
  }

  register(): void {
    if (!this.authEmail || !this.authPassword) return;

    this.apiService.register(this.authEmail, this.authPassword).subscribe({
      next: (response) => {
        // Note: Register returns NotImplementedResponse (501), so no token is actually set
        this.lastResponse = { data: response, status: 201, time: Date.now() };
        this.lastError = null;
      },
      error: (error) => {
        this.lastError = error.error || error;
        this.lastResponse = null;
      }
    });
  }

  logout(): void {
    this.apiService.clearToken();
    this.lastResponse = null;
    this.lastError = null;
  }

  sendRequest(): void {
    if (!this.requestEndpoint) return;

    this.loading = true;
    this.lastResponse = null;
    this.lastError = null;

    const startTime = Date.now();
    let requestData = null;

    if (this.requestBody && ['POST', 'PUT'].includes(this.requestMethod)) {
      try {
        requestData = JSON.parse(this.requestBody);
      } catch (e) {
        this.lastError = { message: 'Invalid JSON in request body' };
        this.loading = false;
        return;
      }
    }

    this.apiService.makeApiCall(this.requestMethod, this.requestEndpoint, requestData).subscribe({
      next: (response) => {
        this.lastResponse = {
          data: response,
          status: 200,
          time: Date.now() - startTime
        };
        this.loading = false;
      },
      error: (error) => {
        this.lastError = {
          ...error.error,
          status: error.status,
          time: Date.now() - startTime
        };
        this.loading = false;
      }
    });
  }

  clearRequest(): void {
    this.requestEndpoint = '';
    this.requestBody = '';
    this.lastResponse = null;
    this.lastError = null;
    this.selectedEndpoint = null;
  }

  loadSample(sample: any): void {
    this.requestMethod = sample.method;
    this.requestEndpoint = sample.endpoint;
    this.requestBody = sample.body ? JSON.stringify(sample.body, null, 2) : '';
  }
}
