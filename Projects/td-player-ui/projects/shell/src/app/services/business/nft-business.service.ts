import { Injectable } from '@angular/core';
import { Observable, map, catchError, of, BehaviorSubject } from 'rxjs';
import { ApiService, CreateNFTRequest, NFTCreatedResponse, NFTAttribute } from '../api.service';

// Define NFTMetadata interface locally for now
interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
}

// Define DisplayNFT class locally for now
class DisplayNFT {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public tokenId: string,
    public image?: string,
    public attributes: NFTAttribute[] = []
  ) {}
}

@Injectable({
  providedIn: 'root'
})
export class NFTBusinessService {
  
  private nftCacheSubject = new BehaviorSubject<DisplayNFT[]>([]);
  public nftCache$ = this.nftCacheSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Business logic: Validate NFT metadata before creation
   */
  validateNFTMetadata(metadata: NFTMetadata): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Business rules for NFT validation
    if (!metadata.name || metadata.name.trim().length === 0) {
      errors.push('NFT name is required');
    }

    if (metadata.name && metadata.name.length > 100) {
      errors.push('NFT name must be 100 characters or less');
    }

    if (!metadata.description || metadata.description.trim().length === 0) {
      errors.push('NFT description is required');
    }

    if (!metadata.image || !this.isValidImageUrl(metadata.image)) {
      errors.push('Valid image URL is required');
    }

    if (metadata.attributes && metadata.attributes.length > 20) {
      errors.push('Maximum 20 attributes allowed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Business logic: Create NFT with business validation
   */
  createNFTWithValidation(
    address: string, 
    metadata: NFTMetadata, 
    transferFee: number = 0
  ): Observable<DisplayNFT | null> {
    
    // Validate metadata
    const validation = this.validateNFTMetadata(metadata);
    if (!validation.valid) {
      console.error('NFT validation failed:', validation.errors);
      return of(null);
    }

    // Business rule: Transfer fee should be between 0 and 50%
    if (transferFee < 0 || transferFee > 50000) {
      console.error('Transfer fee must be between 0 and 50%');
      return of(null);
    }

    const request: CreateNFTRequest = {
      name: metadata.name,
      description: metadata.description,
      imageUrl: metadata.image,  // Map 'image' to 'imageUrl' for backend
      attributes: metadata.attributes,
      transferFee,
      flags: 8 // tfTransferable flag
    };

    return this.apiService.createNFT(request).pipe(
      map(response => {
        if (response?.success && response.data) {
          const displayNFT = this.transformToDisplayNFT(response.data, metadata);
          this.addToCache(displayNFT);
          return displayNFT;
        }
        return null;
      }),
      catchError(error => {
        console.error('NFT creation failed:', error);
        return of(null);
      })
    );
  }

  /**
   * Business logic: Calculate display information for NFT
   */
  calculateNFTDisplayInfo(nft: any): { title: string; subtitle: string; rarity: string } {
    const serialNumber = nft.nft_serial || 0;
    
    // Business rules for rarity calculation
    let rarity = 'Common';
    if (serialNumber <= 10) {
      rarity = 'Legendary';
    } else if (serialNumber <= 50) {
      rarity = 'Epic';
    } else if (serialNumber <= 200) {
      rarity = 'Rare';
    } else if (serialNumber <= 1000) {
      rarity = 'Uncommon';
    }

    return {
      title: `Baseball Card #${serialNumber}`,
      subtitle: `${rarity} Collection`,
      rarity
    };
  }

  /**
   * Business logic: Cache management
   */
  private addToCache(nft: DisplayNFT): void {
    const currentCache = this.nftCacheSubject.value;
    const updatedCache = [...currentCache, nft];
    this.nftCacheSubject.next(updatedCache);
  }

  clearCache(): void {
    this.nftCacheSubject.next([]);
  }

  /**
   * Business logic: Transform API data to display model
   */
  private transformToDisplayNFT(apiData: any, metadata: NFTMetadata): DisplayNFT {
    return new DisplayNFT(
      apiData.nftId || '',           // Use nftId from API response
      metadata.name,
      metadata.description,
      apiData.nftId || '',           // Use nftId as tokenId
      metadata.image,
      metadata.attributes || []
    );
  }

  /**
   * Business logic: Image URL validation
   */
  private isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const validProtocols = ['http:', 'https:'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      
      return validProtocols.includes(urlObj.protocol) &&
             validExtensions.some(ext => url.toLowerCase().includes(ext));
    } catch {
      return false;
    }
  }
}
