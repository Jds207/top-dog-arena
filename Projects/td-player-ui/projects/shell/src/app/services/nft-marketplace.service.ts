import { Injectable, signal, computed } from '@angular/core';

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
}

export interface NFT {
  id: string;
  tokenId: number;
  contractAddress: string;
  owner: string;
  creator: string;
  name: string;
  description: string;
  image: string;
  price: number;
  currency: 'ETH' | 'TDA' | 'USDC';
  category: 'character' | 'weapon' | 'arena' | 'collectible' | 'badge';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  attributes: Array<{
    trait_type: string;
    value: string | number;
    rarity?: number;
  }>;
  isForSale: boolean;
  isFeatured: boolean;
  createdAt: string;
  lastSale?: {
    price: number;
    currency: string;
    buyer: string;
    seller: string;
    timestamp: string;
  };
  views: number;
  likes: number;
  metadata: NFTMetadata;
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  creator: string;
  contractAddress: string;
  floorPrice: number;
  totalVolume: number;
  itemCount: number;
  ownerCount: number;
  isVerified: boolean;
  category: string;
  createdAt: string;
}

export interface MarketplaceStats {
  totalVolume: number;
  totalSales: number;
  totalNFTs: number;
  totalUsers: number;
  floorPrice: number;
  avgPrice: number;
  topCollections: NFTCollection[];
  recentSales: NFT[];
}

@Injectable({
  providedIn: 'root'
})
export class NFTMarketplaceService {
  private readonly MARKETPLACE_STORAGE_KEY = 'tda-nft-marketplace';

  // Mock data for demonstration - Dog Baseball Cards
  private mockNFTs: NFT[] = [
    {
      id: '1',
      tokenId: 101,
      contractAddress: '0x1234...abcd',
      owner: '0xuser1...def',
      creator: '0xcreator1...abc',
      name: 'Rex "The Slugger" Rodriguez',
      description: 'Golden Retriever power hitter with a .350 batting average. Known for his clutch home runs and legendary tail wags.',
      image: 'assets/images/nft-rex-slugger.svg',
      price: 0.125,
      currency: 'ETH',
      category: 'character',
      rarity: 'legendary',
      attributes: [
        { trait_type: 'Batting Average', value: '.350', rarity: 2 },
        { trait_type: 'Home Runs', value: 45, rarity: 1 },
        { trait_type: 'Position', value: 'First Base', rarity: 15 },
        { trait_type: 'Special Move', value: 'Power Bark', rarity: 0.5 }
      ],
      isForSale: true,
      isFeatured: true,
      createdAt: '2025-01-15T10:00:00Z',
      lastSale: {
        price: 0.1,
        currency: 'ETH',
        buyer: '0xbuyer1...xyz',
        seller: '0xseller1...abc',
        timestamp: '2025-01-10T15:30:00Z'
      },
      views: 1250,
      likes: 89,
      metadata: {
        name: 'Rex "The Slugger" Rodriguez',
        description: 'Golden Retriever power hitter with exceptional batting skills',
        image: 'assets/images/nft-rex-slugger.svg',
        attributes: [
          { trait_type: 'Batting Average', value: '.350' },
          { trait_type: 'Home Runs', value: 45 },
          { trait_type: 'Position', value: 'First Base' },
          { trait_type: 'Special Move', value: 'Power Bark' }
        ]
      }
    },
    {
      id: '2',
      tokenId: 202,
      contractAddress: '0x1234...abcd',
      owner: '0xuser2...ghi',
      creator: '0xcreator2...def',
      name: 'Bella "Lightning Paws" Thompson',
      description: 'Border Collie speedster and base-stealing champion. Holds the record for stolen bases in a single season.',
      image: 'assets/images/nft-bella-lightning.svg',
      price: 0.089,
      currency: 'ETH',
      category: 'character',
      rarity: 'epic',
      attributes: [
        { trait_type: 'Speed', value: 98, rarity: 5 },
        { trait_type: 'Stolen Bases', value: 87, rarity: 3 },
        { trait_type: 'Position', value: 'Center Field', rarity: 20 },
        { trait_type: 'Special Move', value: 'Lightning Dash', rarity: 8 }
      ],
      isForSale: true,
      isFeatured: false,
      createdAt: '2025-01-20T14:30:00Z',
      views: 890,
      likes: 45,
      metadata: {
        name: 'Bella "Lightning Paws" Thompson',
        description: 'Border Collie speedster and base-stealing champion',
        image: 'assets/images/nft-bella-lightning.svg',
        attributes: [
          { trait_type: 'Speed', value: 98 },
          { trait_type: 'Stolen Bases', value: 87 },
          { trait_type: 'Position', value: 'Center Field' },
          { trait_type: 'Special Move', value: 'Lightning Dash' }
        ]
      }
    },
    {
      id: '3',
      tokenId: 303,
      contractAddress: '0x1234...abcd',
      owner: '0xuser3...jkl',
      creator: '0xcreator3...ghi',
      name: 'Max "The Ace" Wilson',
      description: 'German Shepherd pitcher with a devastating fastball. Three-time Cy Young winner and strikeout king.',
      image: 'assets/images/nft-max-ace.svg',
      price: 0.156,
      currency: 'ETH',
      category: 'character',
      rarity: 'legendary',
      attributes: [
        { trait_type: 'ERA', value: '1.85', rarity: 1 },
        { trait_type: 'Strikeouts', value: 312, rarity: 2 },
        { trait_type: 'Position', value: 'Pitcher', rarity: 10 },
        { trait_type: 'Special Move', value: 'Howling Fastball', rarity: 1 }
      ],
      isForSale: true,
      isFeatured: true,
      createdAt: '2025-01-18T09:15:00Z',
      views: 2100,
      likes: 156,
      metadata: {
        name: 'Max "The Ace" Wilson',
        description: 'German Shepherd pitcher with devastating fastball',
        image: 'assets/images/nft-max-ace.svg',
        attributes: [
          { trait_type: 'ERA', value: '1.85' },
          { trait_type: 'Strikeouts', value: 312 },
          { trait_type: 'Position', value: 'Pitcher' },
          { trait_type: 'Special Move', value: 'Howling Fastball' }
        ]
      }
    },
    {
      id: '4',
      tokenId: 404,
      contractAddress: '0x5678...efgh',
      owner: '0xuser4...mno',
      creator: '0xcreator4...jkl',
      name: 'Luna "The Wall" Garcia',
      description: 'Siberian Husky catcher with incredible defensive skills. Has never allowed a stolen base in her career.',
      image: 'assets/images/nft-luna-wall.svg',
      price: 0.067,
      currency: 'ETH',
      category: 'character',
      rarity: 'rare',
      attributes: [
        { trait_type: 'Defense', value: 99, rarity: 1 },
        { trait_type: 'Throwing Arm', value: 95, rarity: 5 },
        { trait_type: 'Position', value: 'Catcher', rarity: 12 },
        { trait_type: 'Special Move', value: 'Ice Block', rarity: 10 }
      ],
      isForSale: true,
      isFeatured: false,
      createdAt: '2025-01-12T16:45:00Z',
      lastSale: {
        price: 0.055,
        currency: 'ETH',
        buyer: '0xuser4...mno',
        seller: '0xseller2...def',
        timestamp: '2025-01-12T16:45:00Z'
      },
      views: 680,
      likes: 42,
      metadata: {
        name: 'Luna "The Wall" Garcia',
        description: 'Siberian Husky catcher with incredible defensive skills',
        image: 'assets/images/nft-luna-wall.svg',
        attributes: [
          { trait_type: 'Defense', value: 99 },
          { trait_type: 'Throwing Arm', value: 95 },
          { trait_type: 'Position', value: 'Catcher' },
          { trait_type: 'Special Move', value: 'Ice Block' }
        ]
      }
    },
    {
      id: '5',
      tokenId: 505,
      contractAddress: '0x9abc...ijkl',
      owner: '0xuser5...pqr',
      creator: '0xcreator5...mno',
      name: 'Buddy "Home Run" Davis',
      description: 'Bulldog slugger known for his powerful swing and clutch hitting. Never strikes out in crucial moments.',
      image: 'assets/images/nft-buddy-hr.svg',
      price: 0.034,
      currency: 'ETH',
      category: 'character',
      rarity: 'uncommon',
      attributes: [
        { trait_type: 'Power', value: 88, rarity: 25 },
        { trait_type: 'Clutch', value: 94, rarity: 15 },
        { trait_type: 'Position', value: 'Right Field', rarity: 30 },
        { trait_type: 'Special Move', value: 'Bulldozer Swing', rarity: 20 }
      ],
      isForSale: true,
      isFeatured: false,
      createdAt: '2025-01-25T11:20:00Z',
      views: 445,
      likes: 28,
      metadata: {
        name: 'Buddy "Home Run" Davis',
        description: 'Bulldog slugger known for powerful swing and clutch hitting',
        image: 'assets/images/nft-buddy-hr.svg',
        attributes: [
          { trait_type: 'Power', value: 88 },
          { trait_type: 'Clutch', value: 94 },
          { trait_type: 'Position', value: 'Right Field' },
          { trait_type: 'Special Move', value: 'Bulldozer Swing' }
        ]
      }
    },
    {
      id: '6',
      tokenId: 606,
      contractAddress: '0x1234...abcd',
      owner: '0xuser6...stu',
      creator: '0xcreator6...pqr',
      name: 'Sadie "Gold Glove" Martinez',
      description: 'Australian Shepherd shortstop with unmatched fielding ability. Has won five consecutive Gold Gloves.',
      image: 'assets/images/nft-sadie-glove.svg',
      price: 0.098,
      currency: 'ETH',
      category: 'character',
      rarity: 'epic',
      attributes: [
        { trait_type: 'Fielding', value: 97, rarity: 3 },
        { trait_type: 'Range', value: 93, rarity: 8 },
        { trait_type: 'Position', value: 'Shortstop', rarity: 18 },
        { trait_type: 'Special Move', value: 'Tornado Turn', rarity: 6 }
      ],
      isForSale: true,
      isFeatured: true,
      createdAt: '2025-01-22T13:45:00Z',
      views: 1120,
      likes: 73,
      metadata: {
        name: 'Sadie "Gold Glove" Martinez',
        description: 'Australian Shepherd shortstop with unmatched fielding ability',
        image: 'assets/images/nft-sadie-glove.svg',
        attributes: [
          { trait_type: 'Fielding', value: 97 },
          { trait_type: 'Range', value: 93 },
          { trait_type: 'Position', value: 'Shortstop' },
          { trait_type: 'Special Move', value: 'Tornado Turn' }
        ]
      }
    },
    {
      id: '7',
      tokenId: 707,
      contractAddress: '0x2468...aceg',
      owner: '0xuser7...vwx',
      creator: '0xcreator7...stu',
      name: 'Charlie "The Rookie" Johnson',
      description: 'Young Labrador with incredible potential. Fresh from the minor leagues with impressive stats.',
      image: 'assets/images/nft-charlie-rookie.svg',
      price: 0.021,
      currency: 'ETH',
      category: 'character',
      rarity: 'common',
      attributes: [
        { trait_type: 'Potential', value: 92, rarity: 40 },
        { trait_type: 'Learning', value: 89, rarity: 35 },
        { trait_type: 'Position', value: 'Utility', rarity: 50 },
        { trait_type: 'Special Move', value: 'Puppy Power', rarity: 45 }
      ],
      isForSale: true,
      isFeatured: false,
      createdAt: '2025-01-26T08:30:00Z',
      views: 312,
      likes: 18,
      metadata: {
        name: 'Charlie "The Rookie" Johnson',
        description: 'Young Labrador with incredible potential from minor leagues',
        image: 'assets/images/nft-charlie-rookie.svg',
        attributes: [
          { trait_type: 'Potential', value: 92 },
          { trait_type: 'Learning', value: 89 },
          { trait_type: 'Position', value: 'Utility' },
          { trait_type: 'Special Move', value: 'Puppy Power' }
        ]
      }
    },
    {
      id: '8',
      tokenId: 808,
      contractAddress: '0x1357...bdfh',
      owner: '0xuser8...yza',
      creator: '0xcreator8...vwx',
      name: 'Zeus "The Legend" Anderson',
      description: 'Hall of Fame Great Dane with record-breaking career stats. The most valuable baseball card in the collection.',
      image: 'assets/images/nft-zeus-legend.svg',
      price: 0.275,
      currency: 'ETH',
      category: 'character',
      rarity: 'mythic',
      attributes: [
        { trait_type: 'Career Average', value: '.387', rarity: 0.1 },
        { trait_type: 'Hall of Fame', value: 'Yes', rarity: 0.5 },
        { trait_type: 'Position', value: 'All-Star', rarity: 1 },
        { trait_type: 'Special Move', value: 'Thunder Strike', rarity: 0.2 }
      ],
      isForSale: true,
      isFeatured: true,
      createdAt: '2025-01-05T12:00:00Z',
      lastSale: {
        price: 0.22,
        currency: 'ETH',
        buyer: '0xuser8...yza',
        seller: '0xseller3...ghi',
        timestamp: '2025-01-05T12:00:00Z'
      },
      views: 4500,
      likes: 312,
      metadata: {
        name: 'Zeus "The Legend" Anderson',
        description: 'Hall of Fame Great Dane with record-breaking career stats',
        image: 'assets/images/nft-zeus-legend.svg',
        attributes: [
          { trait_type: 'Career Average', value: '.387' },
          { trait_type: 'Hall of Fame', value: 'Yes' },
          { trait_type: 'Position', value: 'All-Star' },
          { trait_type: 'Special Move', value: 'Thunder Strike' }
        ]
      }
    }
  ];

  private mockCollections: NFTCollection[] = [
    {
      id: '1',
      name: 'Arena Champions',
      description: 'Exclusive badges and rewards for Top Dog Arena champions',
      image: 'assets/images/collection-champions.svg',
      banner: 'assets/images/collection-champions-banner.svg',
      creator: '0xcreator1...abc',
      contractAddress: '0x1234...abcd',
      floorPrice: 1.5,
      totalVolume: 125.8,
      itemCount: 250,
      ownerCount: 180,
      isVerified: true,
      category: 'Gaming',
      createdAt: '2025-01-10T00:00:00Z'
    },
    {
      id: '2',
      name: 'Cyber Warriors',
      description: 'Futuristic character collection for arena battles',
      image: 'assets/images/collection-cyber-warriors.svg',
      banner: 'assets/images/collection-cyber-warriors-banner.svg',
      creator: '0xcreator2...def',
      contractAddress: '0x5678...efgh',
      floorPrice: 0.8,
      totalVolume: 89.4,
      itemCount: 500,
      ownerCount: 320,
      isVerified: true,
      category: 'Characters',
      createdAt: '2025-01-08T00:00:00Z'
    }
  ];

  // Signals for reactive state management
  private nfts = signal<NFT[]>(this.mockNFTs);
  private collections = signal<NFTCollection[]>(this.mockCollections);
  private loading = signal<boolean>(false);
  selectedCategory = signal<string>('all');
  private sortBy = signal<'price' | 'date' | 'popularity'>('price');
  private sortOrder = signal<'asc' | 'desc'>('asc');

  // Computed properties
  readonly allNFTs = computed(() => this.nfts());
  readonly allCollections = computed(() => this.collections());
  readonly featuredNFTs = computed(() => 
    this.nfts().filter(nft => nft.isFeatured)
  );
  readonly isLoading = computed(() => this.loading());
  
  readonly filteredNFTs = computed(() => {
    let filtered = this.nfts();
    
    // Filter by category
    const category = this.selectedCategory();
    if (category !== 'all') {
      filtered = filtered.filter(nft => nft.category === category);
    }
    
    // Sort
    const sortBy = this.sortBy();
    const sortOrder = this.sortOrder();
    
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'date':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          compareValue = a.views - b.views;
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  });

  readonly marketStats = computed(() => {
    const nfts = this.nfts();
    const collections = this.collections();
    
    const totalVolume = nfts.reduce((sum, nft) => 
      sum + (nft.lastSale?.price || 0), 0
    );
    
    const forSaleNFTs = nfts.filter(nft => nft.isForSale);
    const avgPrice = forSaleNFTs.length > 0 
      ? forSaleNFTs.reduce((sum, nft) => sum + nft.price, 0) / forSaleNFTs.length 
      : 0;
    
    const floorPrice = Math.min(...forSaleNFTs.map(nft => nft.price));
    
    return {
      totalVolume,
      totalSales: nfts.filter(nft => nft.lastSale).length,
      totalNFTs: nfts.length,
      totalUsers: new Set([...nfts.map(nft => nft.owner), ...nfts.map(nft => nft.creator)]).size,
      floorPrice,
      avgPrice,
      topCollections: collections.slice(0, 3),
      recentSales: nfts.filter(nft => nft.lastSale).slice(0, 5)
    };
  });

  constructor() {
    this.loadFromStorage();
  }

  // Filter and sorting methods
  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setSorting(sortBy: 'price' | 'date' | 'popularity', order: 'asc' | 'desc' = 'desc'): void {
    this.sortBy.set(sortBy);
    this.sortOrder.set(order);
  }

  // NFT methods
  getNFTById(id: string): NFT | undefined {
    return this.nfts().find(nft => nft.id === id);
  }

  async likeNFT(nftId: string): Promise<void> {
    const nfts = this.nfts();
    const updatedNFTs = nfts.map(nft => 
      nft.id === nftId 
        ? { ...nft, likes: nft.likes + 1 }
        : nft
    );
    this.nfts.set(updatedNFTs);
    this.saveToStorage();
  }

  async viewNFT(nftId: string): Promise<void> {
    const nfts = this.nfts();
    const updatedNFTs = nfts.map(nft => 
      nft.id === nftId 
        ? { ...nft, views: nft.views + 1 }
        : nft
    );
    this.nfts.set(updatedNFTs);
    this.saveToStorage();
  }

  async buyNFT(nftId: string, buyerAddress: string): Promise<boolean> {
    this.loading.set(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nfts = this.nfts();
      const updatedNFTs = nfts.map(nft => {
        if (nft.id === nftId) {
          return {
            ...nft,
            owner: buyerAddress,
            isForSale: false,
            lastSale: {
              price: nft.price,
              currency: nft.currency,
              buyer: buyerAddress,
              seller: nft.owner,
              timestamp: new Date().toISOString()
            }
          };
        }
        return nft;
      });
      
      this.nfts.set(updatedNFTs);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to buy NFT:', error);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  async listNFTForSale(nftId: string, price: number, currency: 'ETH' | 'TDA' | 'USDC'): Promise<boolean> {
    this.loading.set(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const nfts = this.nfts();
      const updatedNFTs = nfts.map(nft => 
        nft.id === nftId 
          ? { ...nft, price, currency, isForSale: true }
          : nft
      );
      
      this.nfts.set(updatedNFTs);
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('Failed to list NFT:', error);
      return false;
    } finally {
      this.loading.set(false);
    }
  }

  // Collection methods
  getCollectionById(id: string): NFTCollection | undefined {
    return this.collections().find(collection => collection.id === id);
  }

  getNFTsByCollection(collectionId: string): NFT[] {
    const collection = this.getCollectionById(collectionId);
    if (!collection) return [];
    
    return this.nfts().filter(nft => nft.contractAddress === collection.contractAddress);
  }

  // Search functionality
  searchNFTs(query: string): NFT[] {
    const searchTerm = query.toLowerCase();
    return this.nfts().filter(nft => 
      nft.name.toLowerCase().includes(searchTerm) ||
      nft.description.toLowerCase().includes(searchTerm) ||
      nft.category.toLowerCase().includes(searchTerm) ||
      nft.creator.toLowerCase().includes(searchTerm)
    );
  }

  // Storage methods
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.MARKETPLACE_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.nfts) this.nfts.set(data.nfts);
        if (data.collections) this.collections.set(data.collections);
      }
    } catch (error) {
      console.warn('Failed to load marketplace data:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = {
        nfts: this.nfts(),
        collections: this.collections(),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.MARKETPLACE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save marketplace data:', error);
    }
  }

  // Utility methods
  formatPrice(price: number, currency: string): string {
    return `${price.toFixed(2)} ${currency}`;
  }

  getRarityColor(rarity: string): string {
    const colors = {
      'common': '#64748b',
      'uncommon': '#10b981',
      'rare': '#3b82f6',
      'epic': '#8b5cf6',
      'legendary': '#f59e0b',
      'mythic': '#ef4444'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  }

  getCategoryIcon(category: string): string {
    const icons = {
      'character': '🤖',
      'weapon': '⚔️',
      'arena': '🏟️',
      'collectible': '💎',
      'badge': '🏆'
    };
    return icons[category as keyof typeof icons] || '🎮';
  }
}
