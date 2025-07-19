import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NFTMarketplaceService, NFT, NFTCollection } from '../../services/nft-marketplace.service';
import { FlippableNftCardComponent, FlippableNFT } from './flippable-nft-card.component';

@Component({
  selector: 'app-nft-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, FlippableNftCardComponent],
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
    { id: 'all', name: 'All Cards', icon: '🃏' },
    { id: 'character', name: 'Players', icon: '🐕' },
    { id: 'rookie', name: 'Rookies', icon: '🌟' },
    { id: 'legend', name: 'Legends', icon: '👑' },
    { id: 'team', name: 'Team Cards', icon: '⚾' },
    { id: 'special', name: 'Special Edition', icon: '💎' }
  ];

  // Big Dog NFT - Featured flippable card
  bigDogNFT: FlippableNFT = {
    id: 'big-dog-001',
    name: 'Big Dog #001',
    frontImage: 'assets/images/big-dog-front.png',
    backImage: 'assets/images/big-dog-back.png',
    rarity: 'legendary',
    price: 5.5,
    currency: 'ETH',
    likes: 247,
    attributes: [
      { trait_type: 'Power', value: 95, rarity: 2.1 },
      { trait_type: 'Speed', value: 88, rarity: 5.3 },
      { trait_type: 'Position', value: 'Cleanup Hitter', rarity: 1.8 },
      { trait_type: 'Team', value: 'Top Dogs', rarity: 100 },
      { trait_type: 'Season', value: '2024', rarity: 15.2 },
      { trait_type: 'Edition', value: 'Genesis', rarity: 0.5 }
    ]
  };

  constructor(
    private marketplaceService: NFTMarketplaceService,
    private router: Router,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('NFT Marketplace - Top Dog Baseball Cards | Top Dog Arena');
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

  // Big Dog NFT interaction methods
  onBigDogLike(nft: FlippableNFT): void {
    this.bigDogNFT.likes++;
    console.log('Big Dog liked!', nft);
  }

  onBigDogBuy(nft: FlippableNFT): void {
    this.showPurchaseModal.set(true);
    console.log('Buying Big Dog NFT!', nft);
  }

  // Modal methods
  async confirmPurchase(): Promise<void> {
    const nft = this.selectedNFT();
    if (nft) {
      try {
        // await this.marketplaceService.purchaseNFT(nft.id);
        console.log('Purchase confirmed for:', nft.name);
        this.showPurchaseModal.set(false);
        this.selectedNFT.set(null);
      } catch (error) {
        console.error('Purchase failed:', error);
      }
    }
  }

  async confirmListing(): Promise<void> {
    const nft = this.selectedNFT();
    if (nft) {
      try {
        // await this.marketplaceService.listNFT(nft.id, this.listingPrice(), this.listingCurrency());
        console.log('Listing confirmed for:', nft.name, 'at', this.listingPrice(), this.listingCurrency());
        this.showListModal.set(false);
        this.selectedNFT.set(null);
        this.listingPrice.set(0);
      } catch (error) {
        console.error('Listing failed:', error);
      }
    }
  }

  cancelModal(): void {
    this.showPurchaseModal.set(false);
    this.showListModal.set(false);
    this.selectedNFT.set(null);
    this.listingPrice.set(0);
  }

  closeModals(): void {
    this.cancelModal();
  }

  // Utility methods
  formatPrice(price: number, currency: string): string {
    return `${price} ${currency}`;
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  getRarityColor(rarity: string): string {
    const colors = {
      'common': '#8e8e93',
      'uncommon': '#34c759',
      'rare': '#007aff',
      'epic': '#af52de',
      'legendary': '#ff9500'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  getRarityClass(rarity: string): string {
    const rarityMap: Record<string, string> = {
      'common': 'rarity-common',
      'uncommon': 'rarity-uncommon',
      'rare': 'rarity-rare',
      'epic': 'rarity-epic',
      'legendary': 'rarity-legendary'
    };
    return rarityMap[rarity] || 'rarity-common';
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
