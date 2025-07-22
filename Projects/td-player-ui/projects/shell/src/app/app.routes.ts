import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'player-landing-page',
    loadComponent: () =>
      import('./components/remote-wrapper.component').then(
        (m) => m.RemoteWrapperComponent,
      ),
  },
  {
    path: 'tournaments',
    loadComponent: () =>
      import('./components/tournaments/tournaments.component').then((m) => m.TournamentsComponent),
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./components/leaderboard/leaderboard.component').then((m) => m.LeaderboardComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'nft-marketplace',
    loadComponent: () =>
      import('./components/nft-marketplace/nft-marketplace.component').then((m) => m.NftMarketplaceComponent),
  },
  // XRPL Connect Page
  {
    path: 'xrpl-connect',
    loadComponent: () =>
      import('./components/xrpl-connect.component').then((m) => m.XrplConnectComponent),
  },
  // Admin Routes
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
  },
  {
    path: 'admin/nft-management',
    loadComponent: () =>
      import('./components/admin/nft-management.component').then((m) => m.NftManagementComponent),
  },
  {
    path: 'admin/user-management',
    loadComponent: () =>
      import('./components/admin/user-management.component').then((m) => m.UserManagementComponent),
  },
  {
    path: 'admin/api-tester',
    loadComponent: () =>
      import('./components/admin/api-tester.component').then((m) => m.ApiTesterComponent),
  },
  {
    path: 'admin/xrpl-monitor',
    loadComponent: () =>
      import('./components/admin/xrpl-monitor.component').then((m) => m.XrplMonitorComponent),
  },
  {
    path: 'xrpl-test',
    loadComponent: () =>
      import('./components/xrpl-connection-test.component').then((m) => m.XrplConnectionTestComponent),
  },
  // Data API Routes - Re-enabled now that database is online
  {
    path: 'data-explorer',
    loadComponent: () =>
      import('./components/data-explorer.component').then((m) => m.DataExplorerComponent),
  },
  {
    path: 'nft-analytics',
    loadComponent: () =>
      import('./components/nft-analytics.component').then((m) => m.NftAnalyticsComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
