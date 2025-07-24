import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFT {
  id: string;
  name: string;
  description: string;
  image?: string;
  attributes: NFTAttribute[];
  tokenId?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateNFTRequest {
  name: string;
  description: string;
  imageUrl: string;  // Backend expects 'imageUrl', not 'image'
  attributes?: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
  transferFee?: number;
  recipient?: string;
  flags?: number;
}

export interface NFTCreatedResponse {
  success: boolean;
  data: {
    nftId: string;
    txHash: string;
    fee: string;
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes?: NFTAttribute[];
      external_url?: string;
      animation_url?: string;
    };
  };
  message: string;
}

export interface AccountNFTsResponse {
  success: boolean;
  data: {
    account: string;
    nfts: Array<{
      Flags: number;
      Issuer: string;
      NFTokenID: string;
      NFTokenTaxon: number;
      TransferFee: number;
      URI: string;
      nft_serial: number;
    }>;
    count: number;
  };
  message: string;
}

export interface WalletInfoResponse {
  success: boolean;
  message: string;
  data: {
    network: {
      network: string;
      serverUrl: string;
      walletAddress: string | null;
    };
    balance: {
      drops: string;
      xrp: string;
    } | null;
    connected: boolean;
    clientConnected: boolean;
  };
}

export interface CreateWalletRequest {
  name?: string;
  description?: string;
}

export interface CreateWalletResponse {
  success: boolean;
  message: string;
  warning?: string;
  timestamp: string;
  data: {
    address: string;
    seed: string;
    publicKey: string;
    network: string;
    databaseId: string;
  };
}

export interface WalletListResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    wallets: WalletInfo[];
    count: number;
    total: number;
  };
}

export interface WalletInfo {
  id: string;
  address: string;
  network: 'testnet' | 'mainnet' | 'devnet';
  balance: string | null; // Balance in drops
  balanceXRP: string | null; // Balance in XRP
  isOwned: boolean;
  isActive: boolean;
  nickname?: string | null;
  description?: string | null;
  tags?: string[] | null;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string | null;
  nftCount: {
    owned: number;
    issued: number;
  };
  // Only included if includeSecrets=true and wallet is owned
  publicKey?: string | null;
  hasSeed?: boolean | null;
  hasPrivateKey?: boolean | null;
}

export interface FundWalletRequest {
  address: string;
  amount?: number; // XRP amount, defaults to 1000 for testnet
}

export interface FundWalletResponse {
  success: boolean;
  message: string;
  timestamp: string;
  data: {
    requestedAddress: string;
    actualAddress: string;
    balance: string; // Amount of XRP funded (e.g., "10")
    network: string;
    seed: string;
    note: string;
  };
}

export interface HealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
}

export interface DetailedHealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
  environment: 'development' | 'production' | 'test';
  services: {
    api: 'healthy' | 'unhealthy';
    xrpl: 'connected' | 'disconnected' | 'not_configured' | 'error';
    database: 'connected' | 'disconnected' | 'not_configured' | 'error';
  };
}

export interface XRPLHealthResponse {
  success: boolean;
  message: string;
  timestamp: string;
  xrpl: {
    network: 'mainnet' | 'testnet' | 'devnet';
    serverUrl: string;
    walletAddress: string | null;
    connected: boolean;
    balance: {
      balance: string;
      available: string;
    } | null;
  };
}

export interface NFTDetailsResponse {
  success: boolean;
  data: {
    nft_id: string;
    ledger_index: number;
    owner: string;
    is_burned: boolean;
    flags: number;
    transfer_fee: number;
    issuer: string;
    nft_taxon: number;
    nft_serial: number;
    uri: string; // Hex-encoded metadata URI
  };
  message: string;
}

export interface BatchCreateNFTRequest {
  nfts: CreateNFTRequest[];
}

export interface BatchNFTResponse {
  success: boolean;
  data: {
    successful: Array<{
      index: number;
      nftId: string;
      txHash: string;
      fee: string;
      metadata: {
        name: string;
        description: string;
        image: string;
        attributes?: NFTAttribute[];
        external_url?: string;
        animation_url?: string;
      };
    }>;
    failed: Array<{
      index: number;
      error: string;
      nftData: any;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
  message: string;
}

export interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  timestamp: string;
  path: string;
}

export interface ValidationErrorResponse {
  success: boolean;
  error: string;
  message: string;
  details: Array<{
    field: string;
    message: string;
  }>;
  timestamp: string;
}

export interface RateLimitErrorResponse {
  success: boolean;
  error: string;
  message: string;
  retryAfter: string;
}

export interface NotImplementedResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface NFTStatsResponse {
  success: boolean;
  data: {
    totalNFTs: number;
    totalAccounts: number;
    recentMints: number; // Last 24 hours
    totalTransactions: number;
  };
  message: string;
}

// New interfaces for updated API contracts

export interface ValidateWalletResponse {
  success: boolean;
  data: {
    address: string;
    isValid: boolean;
    network: string;
  };
  message: string;
  timestamp: string;
}

export interface SyncBalanceResponse {
  success: boolean;
  data: {
    address: string;
    balance: {
      drops: string;
      xrp: string;
    };
    synced: boolean;
  } | null;
  error?: string;
  message: string;
  timestamp: string;
}

export interface SyncAllBalancesResponse {
  success: boolean;
  data: {
    totalAccounts: number;
    successCount: number;
    errorCount: number;
    results: Array<{
      address: string;
      success: boolean;
      balance: string | null;
      error: string | null;
    }>;
  };
  message: string;
  timestamp: string;
}

export interface WalletStatsResponse {
  success: boolean;
  data: {
    totalWallets: number;
    ownedWallets: number;
    externalWallets: number;
    activeWallets: number;
    fundedWallets: number;
    unfundedWallets: number;
    networkDistribution: {
      testnet: number;
      mainnet: number;
      devnet: number;
    };
    recentlyCreated: number; // Last 24 hours
    recentlySynced: number; // Last hour
  };
  message: string;
  timestamp: string;
}

// Songbird Cross-Chain Interfaces

export interface SongbirdStatusResponse {
  success: boolean;
  data: {
    connected: boolean;
    network: string;
    walletAddress: string;
    contractAddress: string;
    balance: string;
  };
  timestamp: string;
}

export interface WrapNFTRequest {
  xrplNftId: string;
  xrplOwnerAddress: string;
  songbirdRecipientAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
}

export interface WrapNFTResponse {
  success: boolean;
  data: {
    songbirdTokenId: string;
    transactionHash: string;
    gasUsed: string;
  };
  message: string;
  timestamp: string;
}

export interface UnwrapNFTRequest {
  songbirdTokenId: string;
}

export interface UnwrapNFTResponse {
  success: boolean;
  data: {
    xrplNftId: string;
    transactionHash: string;
    gasUsed: string;
    owner: string;
  };
  message: string;
  timestamp: string;
}

export interface WrappedNFTInfoResponse {
  success: boolean;
  data: {
    xrplNftId: string;
    isWrapped: boolean;
    owner: string;
    tokenURI: string;
    metadata: any;
  };
  message: string;
  timestamp: string;
}

export interface GasEstimateResponse {
  success: boolean;
  data: {
    operation: string;
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  };
  message: string;
  timestamp: string;
}

export interface SongbirdWalletNFTsResponse {
  success: boolean;
  data: {
    wallet: string;
    nfts: Array<{
      tokenId: string;
      xrplNftId: string;
      isWrapped: boolean;
      tokenURI: string;
      metadata: any;
    }>;
    count: number;
  };
  message: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';
  private tokenSubject = new BehaviorSubject<string | null>(
    this.getStoredToken()
  );
  
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('admin_token');
    }
    return null;
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Authentication (currently returns 501 Not Implemented)
  login(email: string, password: string): Observable<NotImplementedResponse> {
    return this.http.post<NotImplementedResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  register(email: string, password: string): Observable<NotImplementedResponse> {
    return this.http.post<NotImplementedResponse>(`${this.baseUrl}/auth/register`, { email, password });
  }

  setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
    this.tokenSubject.next(token);
  }

  clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  // NFT Management
  createNFT(nftData: CreateNFTRequest): Observable<NFTCreatedResponse> {
    return this.http.post<NFTCreatedResponse>(`${this.baseUrl}/nft/create`, nftData, {
      headers: this.getHeaders()
    });
  }

  // Alias for backward compatibility
  mintNFT(nftData: CreateNFTRequest): Observable<NFTCreatedResponse> {
    return this.createNFT(nftData);
  }

  // Get NFT details by ID (following OpenAPI spec exactly)
  getNFTById(nftId: string): Observable<NFTDetailsResponse> {
    return this.http.get<NFTDetailsResponse>(`${this.baseUrl}/nft/${nftId}`, {
      headers: this.getHeaders()
    });
  }

  // Legacy method alias
  getNFT(nftId: string): Observable<NFTDetailsResponse> {
    return this.getNFTById(nftId);
  }

  // Batch create NFTs
  batchCreateNFTs(request: BatchCreateNFTRequest): Observable<BatchNFTResponse> {
    return this.http.post<BatchNFTResponse>(`${this.baseUrl}/nft/batch-create`, request, {
      headers: this.getHeaders()
    });
  }

  // Get NFTs by account with pagination
  getAccountNFTs(address: string, limit: number = 20, marker?: string): Observable<AccountNFTsResponse> {
    let params = new HttpParams().set('limit', limit.toString());
    if (marker) {
      params = params.set('marker', marker);
    }
    
    return this.http.get<AccountNFTsResponse>(`${this.baseUrl}/nft/account/${address}`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Get wallet info
  getWalletInfo(): Observable<WalletInfoResponse> {
    return this.http.get<WalletInfoResponse>(`${this.baseUrl}/nft/wallet/info`, {
      headers: this.getHeaders()
    });
  }

  // Create a new XRPL wallet
  createWallet(request: CreateWalletRequest = {}): Observable<CreateWalletResponse> {
    return this.http.post<CreateWalletResponse>(`${this.baseUrl}/wallet/create`, request, {
      headers: this.getHeaders()
    });
  }

  // Get list of all wallets with optional parameters
  getWalletList(limit?: number, includeSecrets: boolean = false): Observable<WalletListResponse> {
    let params = new HttpParams();
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    params = params.set('includeSecrets', includeSecrets.toString());

    return this.http.get<WalletListResponse>(`${this.baseUrl}/wallet/list`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Fund a wallet with testnet XRP
  fundWallet(request: FundWalletRequest): Observable<FundWalletResponse> {
    return this.http.post<FundWalletResponse>(`${this.baseUrl}/wallet/fund`, request, {
      headers: this.getHeaders()
    });
  }

  // Get specific wallet details
  getWalletDetails(address: string, includeSecrets: boolean = false): Observable<{success: boolean; data: WalletInfo; message: string; timestamp: string}> {
    let params = new HttpParams().set('includeSecrets', includeSecrets.toString());
    
    return this.http.get<{success: boolean; data: WalletInfo; message: string; timestamp: string}>(`${this.baseUrl}/wallet/${address}`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Validate XRPL address format
  validateWalletAddress(address: string): Observable<ValidateWalletResponse> {
    return this.http.post<ValidateWalletResponse>(`${this.baseUrl}/wallet/validate`, 
      { address }, 
      { headers: this.getHeaders() }
    );
  }

  // Sync wallet balance from XRPL
  syncWalletBalance(address: string): Observable<SyncBalanceResponse> {
    return this.http.post<SyncBalanceResponse>(
      `${this.baseUrl}/wallet/sync-balance`, 
      { address }, 
      { headers: this.getHeaders() }
    );
  }

  // Sync all wallet balances from XRPL
  syncAllWalletBalances(): Observable<SyncAllBalancesResponse> {
    return this.http.post<SyncAllBalancesResponse>(
      `${this.baseUrl}/wallet/sync-all`, 
      {}, 
      { headers: this.getHeaders() }
    );
  }

  // Get wallet statistics
  getWalletStatistics(): Observable<WalletStatsResponse> {
    return this.http.get<WalletStatsResponse>(
      `${this.baseUrl}/wallet/stats`, 
      { headers: this.getHeaders() }
    );
  }

  // User Management (assuming these endpoints exist)
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`, {
      headers: this.getHeaders()
    });
  }

  // Generic API call for testing
  makeApiCall(method: string, endpoint: string, data?: any): Observable<any> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    const options = { headers: this.getHeaders() };

    switch (method.toLowerCase()) {
      case 'get':
        return this.http.get(url, options);
      case 'post':
        return this.http.post(url, data, options);
      case 'put':
        return this.http.put(url, data, options);
      case 'delete':
        return this.http.delete(url, options);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // XRPL Connectivity and Health Checks
  checkXRPLConnection(): Observable<XRPLHealthResponse> {
    return this.http.get<XRPLHealthResponse>(`${this.baseUrl}/health/xrpl`, {
      headers: this.getHeaders()
    });
  }

  getDetailedHealth(): Observable<DetailedHealthResponse> {
    return this.http.get<DetailedHealthResponse>(`${this.baseUrl}/health/detailed`, {
      headers: this.getHeaders()
    });
  }

  checkAPIHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.baseUrl}/health`, {
      headers: this.getHeaders()
    });
  }

  // Get account info through wallet info (since there's no direct account info endpoint)
  getAccountInfo(address: string): Observable<any> {
    // For now, return wallet info or account NFTs to get basic account information
    return this.getWalletInfo();
  }

  // NFT Statistics - New endpoint from updated API spec
  getNFTStatistics(): Observable<NFTStatsResponse> {
    return this.http.get<NFTStatsResponse>(`${this.baseUrl}/stats/nft`, {
      headers: this.getHeaders()
    });
  }

  // Songbird Cross-Chain Methods

  // Get Songbird network status
  getSongbirdStatus(): Observable<SongbirdStatusResponse> {
    return this.http.get<SongbirdStatusResponse>(`${this.baseUrl}/songbird/status`, {
      headers: this.getHeaders()
    });
  }

  // Wrap XRPL NFT to Songbird
  wrapNFTToSongbird(request: WrapNFTRequest): Observable<WrapNFTResponse> {
    return this.http.post<WrapNFTResponse>(`${this.baseUrl}/songbird/wrap`, request, {
      headers: this.getHeaders()
    });
  }

  // Unwrap Songbird NFT back to XRPL
  unwrapNFTFromSongbird(request: UnwrapNFTRequest): Observable<UnwrapNFTResponse> {
    return this.http.post<UnwrapNFTResponse>(`${this.baseUrl}/songbird/unwrap`, request, {
      headers: this.getHeaders()
    });
  }

  // Get wrapped NFT information
  getWrappedNFTInfo(tokenId: string): Observable<WrappedNFTInfoResponse> {
    return this.http.get<WrappedNFTInfoResponse>(`${this.baseUrl}/songbird/nft/${tokenId}`, {
      headers: this.getHeaders()
    });
  }

  // Get gas estimates for Songbird operations
  getSongbirdGasEstimate(operation: 'wrap' | 'unwrap'): Observable<GasEstimateResponse> {
    return this.http.get<GasEstimateResponse>(`${this.baseUrl}/songbird/gas/${operation}`, {
      headers: this.getHeaders()
    });
  }

  // Get wallet's wrapped NFTs on Songbird
  getSongbirdWalletNFTs(address: string): Observable<SongbirdWalletNFTsResponse> {
    return this.http.get<SongbirdWalletNFTsResponse>(`${this.baseUrl}/songbird/wallet/${address}/nfts`, {
      headers: this.getHeaders()
    });
  }
}
