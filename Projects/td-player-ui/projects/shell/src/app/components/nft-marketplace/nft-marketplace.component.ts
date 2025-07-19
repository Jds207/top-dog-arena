import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NFTMarketplaceService, NFT, NFTCollection } from '../../services/nft-marketplace.service';

@Component({
  selector: 'app-nft-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nft-marketplace.component.html',
  styleUrl: './nft-marketplace.component.scss'
})
export class NftMarketplaceComponent implements OnInit {
  // Reactive state
  searchQuery = signal('');
  selectedView = signal<'grid' | 'list'>('grid');
  showFilters = signal(false);
  selectedNFT = signal<NFT | null>(null);
  showPurchaseModal = signal(false);
  showListModal = signal(false);
  listingPrice = signal(0);
  listingCurrency = signal<'ETH' | 'TDA' | 'USDC'>('ETH');

  // Computed properties from service
  readonly allNFTs = computed(() => this.marketplaceService.allNFTs());
  readonly featuredNFTs = computed(() => this.marketplaceService.featuredNFTs());
  readonly filteredNFTs = computed(() => {
    const nfts = this.marketplaceService.filteredNFTs();
    const query = this.searchQuery().toLowerCase();
    
    if (!query) return nfts;
    
    return nfts.filter((nft: NFT) => 
      nft.name.toLowerCase().includes(query) ||
      nft.description.toLowerCase().includes(query) ||
      nft.category.toLowerCase().includes(query)
    );
  });
  readonly marketStats = computed(() => this.marketplaceService.marketStats());
  readonly isLoading = computed(() => this.marketplaceService.isLoading());
  readonly selectedCategory = computed(() => this.marketplaceService.selectedCategory());

  // Categories for filtering
  categories = [
    { id: 'all', name: 'All Cards', icon: '�' },
    { id: 'character', name: 'Players', icon: '🐕' },
    { id: 'rookie', name: 'Rookies', icon: '🌟' },
    { id: 'legend', name: 'Legends', icon: '👑' },
    { id: 'team', name: 'Team Cards', icon: '⚾' },
    { id: 'special', name: 'Special Edition', icon: '💎' }
  ];

  constructor(
    private marketplaceService: NFTMarketplaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load initial data if needed
  }

  // Filter and search methods
  onCategoryChange(category: string): void {
    this.marketplaceService.setCategory(category);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const [sortBy, order] = select.value.split('-');
    this.marketplaceService.setSorting(
      sortBy as 'price' | 'date' | 'popularity',
      order as 'asc' | 'desc'
    );
  }

  selectCategory(categoryId: string): void {
    this.marketplaceService.setCategory(categoryId);
  }

  toggleView(): void {
    this.selectedView.set(this.selectedView() === 'grid' ? 'list' : 'grid');
  }

  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
  }

  // NFT interaction methods
  async onNFTClick(nft: NFT): Promise<void> {
    await this.marketplaceService.viewNFT(nft.id);
    this.selectedNFT.set(nft);
    // Navigate to NFT detail page or open modal
    // For now, we'll use a modal
  }

  async onLikeNFT(nft: NFT, event: Event): Promise<void> {
    event.stopPropagation();
    await this.marketplaceService.likeNFT(nft.id);
  }

  onBuyNFT(nft: NFT): void {
    this.selectedNFT.set(nft);
    this.showPurchaseModal.set(true);
  }

  onListNFT(nft: NFT): void {
    this.selectedNFT.set(nft);
    this.listingPrice.set(nft.price);
    this.listingCurrency.set(nft.currency);
    this.showListModal.set(true);
  }

  // Modal methods
  async confirmPurchase(): Promise<void> {
    const nft = this.selectedNFT();
    if (!nft) return;

    const mockUserAddress = '0xuser123...abc'; // This would come from wallet connection
    const success = await this.marketplaceService.buyNFT(nft.id, mockUserAddress);
    
    if (success) {
      this.showPurchaseModal.set(false);
      this.selectedNFT.set(null);
      // Show success notification
    }
  }

  async confirmListing(): Promise<void> {
    const nft = this.selectedNFT();
    if (!nft) return;

    const success = await this.marketplaceService.listNFTForSale(
      nft.id,
      this.listingPrice(),
      this.listingCurrency()
    );
    
    if (success) {
      this.showListModal.set(false);
      this.selectedNFT.set(null);
      this.listingPrice.set(0);
      // Show success notification
    }
  }

  closeModals(): void {
    this.showPurchaseModal.set(false);
    this.showListModal.set(false);
    this.selectedNFT.set(null);
  }

  // Utility methods
  formatPrice(price: number, currency: string): string {
    return this.marketplaceService.formatPrice(price, currency);
  }

  getRarityColor(rarity: string): string {
    return this.marketplaceService.getRarityColor(rarity);
  }

  getCategoryIcon(category: string): string {
    return this.marketplaceService.getCategoryIcon(category);
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getTimeSince(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }

  // Navigation methods
  goToCollection(collectionId: string): void {
    this.router.navigate(['/nft/collection', collectionId]);
  }

  goToProfile(userAddress: string): void {
    this.router.navigate(['/nft/profile', userAddress]);
  }

  // TrackBy function for performance
  trackByNFTId(index: number, nft: NFT): string {
    return nft.id;
  }
}
