import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { WalletBusinessService } from '../../services/business/wallet-business.service';
import { NFTBusinessService } from '../../services/business/nft-business.service';
import { WalletInfo } from '../../models/api/wallet.models';
import { DisplayNFT, NFTMetadata } from '../../models/api/nft.models';
import { XRPLNetwork } from '../../models/base-types';

/**
 * Example Component showing proper architecture:
 * - Components handle only DOM-affecting logic
 * - Business logic is delegated to services
 * - Models provide proper TypeScript types
 * - Template and styles should be in separate files (this is just an example)
 */
@Component({
  selector: 'app-example-component',
  template: `<div>Example component for architecture demonstration</div>`,
  styles: [`div { padding: 1rem; }`]
})
export class ExampleComponent implements OnInit, OnDestroy {
  // UI State Properties (DOM-affecting only)
  isCreatingWallet = false;
  isCreatingNFT = false;
  currentWallet: WalletInfo | null = null;
  nftCreated: DisplayNFT | null = null;
  displayBalance = '0 XRP';

  private destroy$ = new Subject<void>();

  constructor(
    private walletBusiness: WalletBusinessService,
    private nftBusiness: NFTBusinessService
  ) {}

  ngOnInit(): void {
    // Subscribe to NFT cache updates
    this.nftBusiness.nftCache$
      .pipe(takeUntil(this.destroy$))
      .subscribe(nfts => {
        // DOM logic: Update UI when NFT cache changes
        console.log('NFT cache updated:', nfts.length);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // DOM Event Handler: Create wallet
  createWallet(): void {
    this.isCreatingWallet = true; // UI state change

    // Business logic is handled in the service
    this.walletBusiness.createWalletWithValidation('testnet' as XRPLNetwork)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (wallet) => {
          // DOM logic: Update UI with wallet data
          this.currentWallet = wallet;
          this.displayBalance = this.walletBusiness.calculateDisplayBalance(wallet.balance);
          this.isCreatingWallet = false;
        },
        error: (error) => {
          // DOM logic: Show error state
          console.error('Wallet creation failed:', error);
          this.isCreatingWallet = false;
        }
      });
  }

  // DOM Event Handler: Create NFT
  createNFT(): void {
    if (!this.currentWallet) return;

    this.isCreatingNFT = true; // UI state change

    // Prepare NFT metadata (this could come from a form)
    const metadata: NFTMetadata = {
      name: 'Example Baseball Card',
      description: 'A sample NFT created through the business service',
      image: 'https://example.com/image.jpg',
      attributes: [
        { trait_type: 'Player', value: 'Sample Player' },
        { trait_type: 'Team', value: 'Sample Team' }
      ]
    };

    // Business logic is handled in the service
    this.nftBusiness.createNFTWithValidation(this.currentWallet.address, metadata, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (nft) => {
          // DOM logic: Update UI with NFT data
          if (nft) {
            this.nftCreated = nft;
          }
          this.isCreatingNFT = false;
        },
        error: (error) => {
          // DOM logic: Show error state
          console.error('NFT creation failed:', error);
          this.isCreatingNFT = false;
        }
      });
  }

  // DOM Helper: Validate form inputs (UI logic only)
  isFormValid(): boolean {
    return this.currentWallet !== null;
  }

  // DOM Helper: Format display text (UI logic only)
  getStatusMessage(): string {
    if (this.isCreatingWallet) return 'Creating wallet...';
    if (this.isCreatingNFT) return 'Minting NFT...';
    if (this.currentWallet) return 'Ready to mint NFTs';
    return 'Create a wallet to get started';
  }
}
