import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <header class="admin-header">
        <h1>🏟️ Top Dog Arena - Admin Dashboard</h1>
        <div class="admin-user-info">
          <span>Welcome, Admin</span>
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>

      <div class="admin-content">
        <div class="admin-grid">
          <div class="admin-card" routerLink="/admin/nft-management">
            <div class="card-icon">🎴</div>
            <h3>NFT Management</h3>
            <p>Create, mint, and manage NFTs on XRPL</p>
          </div>

          <div class="admin-card" routerLink="/admin/wallet-management">
            <div class="card-icon">💰</div>
            <h3>Wallet Management</h3>
            <p>Create and manage XRPL wallets</p>
          </div>

          <div class="admin-card" routerLink="/admin/user-management">
            <div class="card-icon">👥</div>
            <h3>User Management</h3>
            <p>View and manage registered users</p>
          </div>

          <div class="admin-card" routerLink="/admin/api-tester">
            <div class="card-icon">🔧</div>
            <h3>API Tester</h3>
            <p>Test API endpoints interactively</p>
          </div>

          <div class="admin-card" routerLink="/admin/xrpl-monitor">
            <div class="card-icon">🔗</div>
            <h3>XRPL Monitor</h3>
            <p>Monitor blockchain transactions</p>
          </div>
        </div>

        <div class="admin-stats">
          <h2>System Status</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <h4>API Status</h4>
              <span class="status" [class.online]="apiStatus" [class.offline]="!apiStatus">
                {{ apiStatus ? '🟢 Online' : '🔴 Offline' }}
              </span>
            </div>
            
            <div class="stat-card">
              <h4>XRPL Network</h4>
              <span class="status online">🟢 Songbird Testnet</span>
            </div>

            <div class="stat-card">
              <h4>Authentication</h4>
              <span class="status" [class.online]="isAuthenticated" [class.offline]="!isAuthenticated">
                {{ isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .admin-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
    }

    .admin-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }

    .admin-user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logout-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    .admin-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .admin-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: inherit;
    }

    .admin-card:hover {
      transform: translateY(-5px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .admin-card h3 {
      margin: 1rem 0 0.5rem 0;
      font-size: 1.25rem;
    }

    .admin-card p {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }

    .admin-stats {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
    }

    .admin-stats h2 {
      margin: 0 0 1.5rem 0;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
      text-align: center;
    }

    .stat-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .status {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .status.online {
      color: #4ade80;
    }

    .status.offline {
      color: #f87171;
    }
  `]
})
export class AdminDashboardComponent {
  apiStatus = true; // You can implement actual API health check
  isAuthenticated = false;

  constructor(private apiService: ApiService) {
    this.isAuthenticated = this.apiService.isAuthenticated();
  }

  logout(): void {
    this.apiService.clearToken();
    // Redirect to login or home
  }
}
