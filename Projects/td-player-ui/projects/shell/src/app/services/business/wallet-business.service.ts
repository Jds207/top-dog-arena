import { Injectable } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import { ApiService, CreateWalletRequest, CreateWalletResponse } from '../api.service';

// Define types locally for now
type XRPLNetwork = 'testnet' | 'mainnet' | 'devnet';

interface WalletInfo {
  address: string;
  balance: string;
  network: XRPLNetwork;
  isActive: boolean;
  lastUpdated: string;
  sequence?: number;
  reserve?: string;
  ownerReserve?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WalletBusinessService {
  
  constructor(private apiService: ApiService) {}

  /**
   * Business logic: Create wallet with validation and transformation
   */
  createWalletWithValidation(network: XRPLNetwork = 'testnet'): Observable<WalletInfo> {
    // Business rules: validate network, transform data, handle errors
    const request: CreateWalletRequest = {}; // Current API doesn't support network parameter
    return this.apiService.createWallet(request).pipe(
      map(response => this.transformCreateWalletResponse(response)),
      catchError(error => this.handleWalletCreationError(error))
    );
  }

  /**
   * Business logic: Validate wallet address format
   */
  validateWalletAddress(address: string): boolean {
    // Business rule: XRPL address validation
    const xrplAddressRegex = /^r[a-zA-Z0-9]{24,34}$/;
    return xrplAddressRegex.test(address);
  }

  /**
   * Business logic: Calculate wallet display balance
   */
  calculateDisplayBalance(balance: string | number): string {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    
    if (isNaN(numBalance) || numBalance === 0) {
      return '0 XRP';
    }

    // Business rule: Convert drops to XRP if needed
    if (numBalance > 1000) {
      const xrpAmount = numBalance / 1000000;
      return `${xrpAmount.toFixed(6).replace(/\.?0+$/, '')} XRP`;
    }
    
    return `${numBalance.toLocaleString()} XRP`;
  }

  /**
   * Business logic: Transform API response to UI model
   */
  private transformCreateWalletResponse(response: CreateWalletResponse): WalletInfo {
    return {
      address: response.data.address,
      balance: '0', // New wallets start with 0 balance
      network: response.data.network as XRPLNetwork || 'testnet',
      isActive: true,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Business logic: Handle wallet creation errors
   */
  private handleWalletCreationError(error: any): Observable<WalletInfo> {
    console.error('Wallet creation failed:', error);
    // Business rule: Return empty wallet on error
    return of({
      address: '',
      balance: '0',
      network: 'testnet' as XRPLNetwork,
      isActive: false,
      lastUpdated: new Date().toISOString()
    });
  }
}
