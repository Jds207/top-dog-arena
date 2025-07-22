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
  image: string;
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
  data: {
    network: {
      network: string;
      serverUrl: string;
      walletAddress: string | null;
    };
    balance: {
      balance: string;
      available: string;
    } | null;
  };
  message: string;
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
    totalTransactions: number;
    averageTransferFee: number;
    lastUpdated: string;
  };
  message: string;
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
}
