import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ApiService, NFT, CreateNFTRequest, NFTCreatedResponse, AccountNFTsResponse } from '../../services/api.service';

@Component({
  selector: 'app-nft-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="nft-management">
      <header class="page-header">
        <h1>🎴 NFT Management</h1>
        <button routerLink="/admin" class="back-btn">← Back to Dashboard</button>
      </header>

      <div class="nft-content">
        <div class="nft-sections">
          <!-- Mint NFT Section -->
          <div class="nft-section">
            <h2>Mint New NFT</h2>
            <form [formGroup]="mintForm" (ngSubmit)="mintNFT()" class="mint-form">
              <div class="form-group">
                <label for="name">NFT Name *</label>
                <input 
                  id="name" 
                  type="text" 
                  formControlName="name" 
                  placeholder="e.g., Rookie Baseball Card #001"
                  [class.error]="mintForm.get('name')?.invalid && mintForm.get('name')?.touched"
                >
              </div>

              <div class="form-group">
                <label for="description">Description *</label>
                <textarea 
                  id="description" 
                  formControlName="description" 
                  placeholder="Describe this NFT..."
                  rows="3"
                  [class.error]="mintForm.get('description')?.invalid && mintForm.get('description')?.touched"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="image">Image URL</label>
                <input 
                  id="image" 
                  type="url" 
                  formControlName="image" 
                  placeholder="https://example.com/image.png"
                >
              </div>

              <div class="form-group">
                <label>Attributes</label>
                <div formArrayName="attributes" class="attributes-array">
                  <div *ngFor="let attr of attributes.controls; let i = index" 
                       [formGroupName]="i" 
                       class="attribute-row">
                    <input 
                      type="text" 
                      formControlName="trait_type" 
                      placeholder="Trait Type (e.g., Rarity)"
                      class="trait-input"
                    >
                    <input 
                      type="text" 
                      formControlName="value" 
                      placeholder="Value (e.g., Legendary)"
                      class="value-input"
                    >
                    <button type="button" (click)="removeAttribute(i)" class="remove-btn">×</button>
                  </div>
                  <button type="button" (click)="addAttribute()" class="add-attr-btn">+ Add Attribute</button>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  [disabled]="mintForm.invalid || minting" 
                  class="mint-btn"
                >
                  {{ minting ? 'Minting...' : 'Mint NFT on XRPL' }}
                </button>
              </div>
            </form>

            <div *ngIf="mintResult" class="mint-result">
              <h3>✅ NFT Minted Successfully!</h3>
              <div class="result-details">
                <p><strong>NFT ID:</strong> {{ mintResult.data.nftId || 'Pending...' }}</p>
                <p><strong>Transaction Hash:</strong> {{ mintResult.data.txHash || 'Pending...' }}</p>
                <p><strong>Fee:</strong> {{ mintResult.data.fee || 'N/A' }} drops</p>
                <p><strong>Name:</strong> {{ mintResult.data.metadata.name || 'N/A' }}</p>
                <p><strong>Description:</strong> {{ mintResult.data.metadata.description || 'N/A' }}</p>
                <p><strong>Message:</strong> {{ mintResult.message }}</p>
              </div>
            </div>

            <div *ngIf="mintError" class="error-message">
              <h3>❌ Minting Failed</h3>
              <p>{{ mintError }}</p>
            </div>
          </div>

          <!-- NFT Lookup Section -->
          <div class="nft-section">
            <h2>NFT Lookup</h2>
            <div class="lookup-form">
              <div class="form-group">
                <label for="tokenId">Token ID</label>
                <input 
                  id="tokenId" 
                  type="text" 
                  [(ngModel)]="lookupTokenId" 
                  placeholder="Enter NFT Token ID"
                >
                <button (click)="lookupNFT()" [disabled]="!lookupTokenId" class="lookup-btn">
                  Lookup NFT
                </button>
              </div>

              <div class="form-group">
                <label for="walletAddress">Wallet Address</label>
                <input 
                  id="walletAddress" 
                  type="text" 
                  [(ngModel)]="walletAddress" 
                  placeholder="Enter XRPL wallet address"
                >
                <button (click)="getAccountNFTs()" [disabled]="!walletAddress" class="lookup-btn">
                  Get Account NFTs
                </button>
              </div>
            </div>

            <div *ngIf="lookedUpNFT" class="nft-details">
              <h3>NFT Details</h3>
              <div class="nft-card">
                <img *ngIf="lookedUpNFT.image" [src]="lookedUpNFT.image" [alt]="lookedUpNFT.name" class="nft-image">
                <div class="nft-info">
                  <h4>{{ lookedUpNFT.name }}</h4>
                  <p>{{ lookedUpNFT.description }}</p>
                  <div class="nft-attributes">
                    <div *ngFor="let attr of lookedUpNFT.attributes" class="attribute-tag">
                      <span class="trait-type">{{ attr.trait_type }}:</span>
                      <span class="trait-value">{{ attr.value }}</span>
                    </div>
                  </div>
                  <div class="nft-meta">
                    <p><strong>Token ID:</strong> {{ lookedUpNFT.tokenId || 'N/A' }}</p>
                    <p><strong>Created:</strong> {{ lookedUpNFT.createdAt | date }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="accountNFTs.length > 0" class="account-nfts">
              <h3>Account NFTs ({{ accountNFTs.length }})</h3>
              <div class="nfts-grid">
                <div *ngFor="let nft of accountNFTs" class="nft-card-mini">
                  <img *ngIf="nft.image" [src]="nft.image" [alt]="nft.name" class="nft-image-mini">
                  <div class="nft-info-mini">
                    <h5>{{ nft.name }}</h5>
                    <p>{{ nft.tokenId || 'No Token ID' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="lookupError" class="error-message">
              <p>{{ lookupError }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nft-management {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    .nft-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .nft-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .nft-section {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
    }

    .nft-section h2 {
      margin: 0 0 1.5rem 0;
      color: #fbbf24;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
      color: #e5e7eb;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.9rem;
    }

    .form-group input::placeholder,
    .form-group textarea::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .form-group input.error,
    .form-group textarea.error {
      border-color: #f87171;
    }

    .attributes-array {
      space-y: 0.5rem;
    }

    .attribute-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .trait-input,
    .value-input {
      flex: 1;
      margin: 0;
    }

    .remove-btn {
      width: 32px;
      height: 32px;
      background: #f87171;
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-weight: bold;
    }

    .add-attr-btn {
      padding: 0.5rem 1rem;
      background: rgba(34, 197, 94, 0.8);
      border: none;
      border-radius: 4px;
      color: white;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .mint-btn,
    .lookup-btn {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(45deg, #10b981, #059669);
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mint-btn:hover,
    .lookup-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .mint-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .mint-result {
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.4);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .error-message {
      background: rgba(248, 113, 113, 0.2);
      border: 1px solid rgba(248, 113, 113, 0.4);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .lookup-form .form-group {
      display: flex;
      gap: 0.5rem;
      align-items: end;
    }

    .lookup-form input {
      flex: 1;
      margin: 0;
    }

    .nft-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
    }

    .nft-image {
      width: 100%;
      max-width: 200px;
      height: auto;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .nft-attributes {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1rem 0;
    }

    .attribute-tag {
      background: rgba(59, 130, 246, 0.3);
      border-radius: 4px;
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }

    .nfts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }

    .nft-card-mini {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      padding: 0.5rem;
      text-align: center;
    }

    .nft-image-mini {
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .nft-info-mini h5 {
      margin: 0 0 0.25rem 0;
      font-size: 0.8rem;
    }

    .nft-info-mini p {
      margin: 0;
      font-size: 0.7rem;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      .nft-sections {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class NftManagementComponent implements OnInit {
  mintForm: FormGroup;
  minting = false;
  mintResult: NFTCreatedResponse | null = null;
  mintError: string | null = null;

  lookupTokenId = '';
  walletAddress = '';
  lookedUpNFT: any | null = null; // Using any since NFT details response structure may vary
  accountNFTs: any[] = []; // Will hold transformed NFT data
  lookupError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.mintForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      image: [''],
      attributes: this.fb.array([
        this.createAttributeGroup()
      ])
    });
  }

  ngOnInit() {
    // Add some default attributes
    this.addAttribute();
    this.addAttribute();
  }

  get attributes(): FormArray {
    return this.mintForm.get('attributes') as FormArray;
  }

  createAttributeGroup(): FormGroup {
    return this.fb.group({
      trait_type: [''],
      value: ['']
    });
  }

  addAttribute(): void {
    this.attributes.push(this.createAttributeGroup());
  }

  removeAttribute(index: number): void {
    if (this.attributes.length > 1) {
      this.attributes.removeAt(index);
    }
  }

  mintNFT(): void {
    if (this.mintForm.invalid) return;

    this.minting = true;
    this.mintResult = null;
    this.mintError = null;

    const formValue = this.mintForm.value;
    const mintRequest: CreateNFTRequest = {
      name: formValue.name,
      description: formValue.description,
      imageUrl: formValue.image || 'https://placeholder.com/300x300',  // Use imageUrl for backend
      attributes: formValue.attributes.filter((attr: any) => attr.trait_type && attr.value)
    };

    this.apiService.mintNFT(mintRequest).subscribe({
      next: (result) => {
        this.mintResult = result;
        this.minting = false;
        this.mintForm.reset();
        // Reset attributes to default
        while (this.attributes.length > 1) {
          this.attributes.removeAt(this.attributes.length - 1);
        }
        this.addAttribute();
        this.addAttribute();
      },
      error: (error) => {
        this.mintError = error.error?.message || 'Failed to mint NFT';
        this.minting = false;
      }
    });
  }

  lookupNFT(): void {
    if (!this.lookupTokenId) return;

    this.lookedUpNFT = null;
    this.lookupError = null;

    this.apiService.getNFT(this.lookupTokenId).subscribe({
      next: (nft) => {
        this.lookedUpNFT = nft;
      },
      error: (error) => {
        this.lookupError = error.error?.message || 'Failed to find NFT';
      }
    });
  }

  getAccountNFTs(): void {
    if (!this.walletAddress) return;

    this.accountNFTs = [];
    this.lookupError = null;

    this.apiService.getAccountNFTs(this.walletAddress).subscribe({
      next: (response: AccountNFTsResponse) => {
        if (response.success && response.data) {
          // Transform XRPL NFT data to display format
          this.accountNFTs = response.data.nfts.map(nft => ({
            id: nft.NFTokenID,
            name: `NFT #${nft.nft_serial}`,
            description: `NFT from ${nft.Issuer}`,
            tokenId: nft.NFTokenID,
            image: nft.URI ? this.decodeHexURI(nft.URI) : undefined,
            attributes: [
              { trait_type: 'Serial', value: nft.nft_serial.toString() },
              { trait_type: 'Taxon', value: nft.NFTokenTaxon.toString() },
              { trait_type: 'Transfer Fee', value: `${nft.TransferFee / 1000}%` }
            ]
          }));
        } else {
          this.accountNFTs = [];
        }
      },
      error: (error) => {
        this.lookupError = error.error?.message || 'Failed to get account NFTs';
      }
    });
  }

  private decodeHexURI(hexString: string): string {
    try {
      // Remove '0x' prefix if present
      const cleanHex = hexString.replace(/^0x/, '');
      // Convert hex to string
      let result = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        result += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
      return result;
    } catch (error) {
      console.warn('Failed to decode hex URI:', hexString, error);
      return 'https://placeholder.com/150x150';
    }
  }
}
