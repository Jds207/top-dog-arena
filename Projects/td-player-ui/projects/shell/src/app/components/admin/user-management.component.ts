import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, User } from '../../services/api.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-management">
      <header class="page-header">
        <h1>👥 User Management</h1>
        <button routerLink="/admin" class="back-btn">← Back to Dashboard</button>
      </header>

      <div class="user-content">
        <div class="user-stats">
          <div class="stat-card">
            <h3>{{ users.length }}</h3>
            <p>Total Users</p>
          </div>
          <div class="stat-card">
            <h3>{{ activeUsers }}</h3>
            <p>Active Today</p>
          </div>
          <div class="stat-card">
            <h3>{{ newUsers }}</h3>
            <p>New This Week</p>
          </div>
        </div>

        <div class="users-section">
          <div class="section-header">
            <h2>Registered Users</h2>
            <button (click)="loadUsers()" class="refresh-btn">🔄 Refresh</button>
          </div>

          <div *ngIf="loading" class="loading">
            <div class="spinner"></div>
            <span>Loading users...</span>
          </div>

          <div *ngIf="error" class="error-message">
            <p>{{ error }}</p>
            <button (click)="loadUsers()" class="retry-btn">Retry</button>
          </div>

          <div *ngIf="!loading && !error" class="users-table">
            <div class="table-header">
              <div class="header-cell">Email</div>
              <div class="header-cell">User ID</div>
              <div class="header-cell">Created</div>
              <div class="header-cell">Last Updated</div>
              <div class="header-cell">Actions</div>
            </div>

            <div *ngFor="let user of users; trackBy: trackByUserId" class="user-row">
              <div class="cell">{{ user.email }}</div>
              <div class="cell">
                <code>{{ user.id }}</code>
              </div>
              <div class="cell">
                {{ user.createdAt | date:'short' }}
              </div>
              <div class="cell">
                {{ user.updatedAt | date:'short' }}
              </div>
              <div class="cell actions">
                <button (click)="viewUser(user)" class="action-btn view">View</button>
                <button (click)="getUserNFTs(user)" class="action-btn nfts">NFTs</button>
              </div>
            </div>

            <div *ngIf="users.length === 0" class="no-users">
              <p>No users found. Users will appear here after registration.</p>
            </div>
          </div>
        </div>

        <!-- User Details Modal -->
        <div *ngIf="selectedUser" class="modal-overlay" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>User Details</h3>
              <button (click)="closeModal()" class="close-btn">×</button>
            </div>
            
            <div class="modal-body">
              <div class="user-details">
                <div class="detail-row">
                  <label>Email:</label>
                  <span>{{ selectedUser.email }}</span>
                </div>
                <div class="detail-row">
                  <label>User ID:</label>
                  <span><code>{{ selectedUser.id }}</code></span>
                </div>
                <div class="detail-row">
                  <label>Created:</label>
                  <span>{{ selectedUser.createdAt | date:'full' }}</span>
                </div>
                <div class="detail-row">
                  <label>Last Updated:</label>
                  <span>{{ selectedUser.updatedAt | date:'full' }}</span>
                </div>
              </div>

              <div *ngIf="userNFTs.length > 0" class="user-nfts">
                <h4>User NFTs ({{ userNFTs.length }})</h4>
                <div class="nfts-grid">
                  <div *ngFor="let nft of userNFTs" class="nft-card">
                    <img *ngIf="nft.image" [src]="nft.image" [alt]="nft.name" class="nft-image">
                    <div class="nft-info">
                      <h5>{{ nft.name }}</h5>
                      <p>{{ nft.description | slice:0:100 }}{{ nft.description.length > 100 ? '...' : '' }}</p>
                      <div class="nft-meta">
                        <span>Token: {{ nft.tokenId || 'N/A' }}</span>
                        <span>{{ nft.createdAt | date:'short' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div *ngIf="nftLoading" class="loading-nfts">
                <div class="spinner-small"></div>
                <span>Loading user NFTs...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management {
      min-height: 100vh;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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

    .user-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .user-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 1.5rem;
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: #fbbf24;
    }

    .stat-card p {
      margin: 0;
      opacity: 0.8;
    }

    .users-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h2 {
      margin: 0;
      color: #fbbf24;
    }

    .refresh-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
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

    .error-message {
      text-align: center;
      padding: 2rem;
      background: rgba(248, 113, 113, 0.2);
      border: 1px solid rgba(248, 113, 113, 0.4);
      border-radius: 8px;
    }

    .retry-btn {
      padding: 0.5rem 1rem;
      background: #ef4444;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      margin-top: 1rem;
    }

    .users-table {
      overflow-x: auto;
    }

    .table-header,
    .user-row {
      display: grid;
      grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .table-header {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px 4px 0 0;
      font-weight: bold;
    }

    .user-row {
      transition: background 0.2s;
    }

    .user-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .cell {
      display: flex;
      align-items: center;
    }

    .cell code {
      background: rgba(0, 0, 0, 0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-size: 0.8rem;
    }

    .actions {
      gap: 0.5rem;
    }

    .action-btn {
      padding: 0.25rem 0.75rem;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .action-btn.view {
      background: #3b82f6;
      color: white;
    }

    .action-btn.nfts {
      background: #8b5cf6;
      color: white;
    }

    .no-users {
      text-align: center;
      padding: 3rem;
      opacity: 0.6;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 2rem;
    }

    .modal-content {
      background: linear-gradient(135deg, #4c1d95, #6d28d9);
      border-radius: 12px;
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .modal-header h3 {
      margin: 0;
      color: #fbbf24;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.25rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .user-details {
      margin-bottom: 2rem;
    }

    .detail-row {
      display: flex;
      margin-bottom: 1rem;
      align-items: center;
    }

    .detail-row label {
      font-weight: bold;
      width: 120px;
      color: #e5e7eb;
    }

    .user-nfts h4 {
      margin: 0 0 1rem 0;
      color: #fbbf24;
    }

    .nfts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .nft-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 1rem;
    }

    .nft-image {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .nft-info h5 {
      margin: 0 0 0.5rem 0;
      font-size: 0.9rem;
    }

    .nft-info p {
      margin: 0 0 0.5rem 0;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    .nft-meta {
      font-size: 0.7rem;
      opacity: 0.6;
    }

    .loading-nfts {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
    }

    .spinner-small {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @media (max-width: 768px) {
      .table-header,
      .user-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      
      .modal-overlay {
        padding: 1rem;
      }
      
      .nfts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  
  selectedUser: User | null = null;
  userNFTs: any[] = [];
  nftLoading = false;

  // Mock stats - in real app, these would come from the API
  activeUsers = 0;
  newUsers = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = null;

    // Note: This assumes the API has a users endpoint
    // You may need to implement this in your backend
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
        this.calculateStats();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to load users';
        this.loading = false;
        // For demo purposes, show some mock data if API fails
        this.loadMockUsers();
      }
    });
  }

  loadMockUsers(): void {
    // Mock data for demonstration
    this.users = [
      {
        id: '1',
        email: 'admin@topdog.arena',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2', 
        email: 'player1@example.com',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '3',
        email: 'collector@nft.com',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.calculateStats();
    this.error = 'Using mock data - implement /api/admin/users endpoint';
  }

  calculateStats(): void {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 86400000 * 7);
    const dayAgo = new Date(now.getTime() - 86400000);

    this.newUsers = this.users.filter(user => 
      new Date(user.createdAt) > weekAgo
    ).length;

    this.activeUsers = this.users.filter(user => 
      new Date(user.updatedAt) > dayAgo
    ).length;
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  viewUser(user: User): void {
    this.selectedUser = user;
    this.userNFTs = [];
  }

  getUserNFTs(user: User): void {
    this.selectedUser = user;
    this.userNFTs = [];
    this.nftLoading = true;

    // This would need a way to get user's wallet address
    // For now, we'll show a placeholder
    setTimeout(() => {
      this.nftLoading = false;
      // Mock NFT data
      this.userNFTs = [
        {
          id: '1',
          name: 'Baseball Card #001',
          description: 'Rookie card with holographic finish',
          image: 'https://via.placeholder.com/150x200/4f46e5/white?text=NFT',
          tokenId: 'ABC123',
          createdAt: new Date().toISOString()
        }
      ];
    }, 1500);
  }

  closeModal(): void {
    this.selectedUser = null;
    this.userNFTs = [];
    this.nftLoading = false;
  }
}
