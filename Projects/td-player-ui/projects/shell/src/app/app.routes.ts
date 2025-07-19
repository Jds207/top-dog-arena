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
    path: 'settings',
    loadComponent: () =>
      import('./components/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'nft-marketplace',
    loadComponent: () =>
      import('./components/nft-marketplace/nft-marketplace.component').then((m) => m.NftMarketplaceComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
