import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// NFT Data Types
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface Account {
  address: string;
  nickname: string | null;
}

export interface NFTData {
  nftId: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: NFTAttribute[];
  owner: Account;
  issuer: Account;
  txHash: string;
  fee: string;
  mintedAt: string;
  category: string;
  rarity: string | null;
  isBurned: boolean;
  isTransferable: boolean;
}

export interface NFTDetailsResponse {
  success: boolean;
  data: NFTData;
  timestamp: string;
}

export interface AccountNFTsData {
  nftId: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: NFTAttribute[];
  issuer: Account;
  txHash: string;
  mintedAt: string;
  category: string;
  rarity: string | null;
}

export interface AccountNFTsResponse {
  success: boolean;
  data: {
    account: string;
    nfts: AccountNFTsData[];
    count: number;
    limit: number;
    offset: number;
  };
  timestamp: string;
}

export interface NFTStatistics {
  totalNFTs: number;
  activeNFTs: number;
  burnedNFTs: number;
  totalAccounts: number;
  recentMints: number;
}

export interface NFTStatsResponse {
  success: boolean;
  data: NFTStatistics;
  message: string;
  timestamp: string;
}

export interface WalletBalance {
  drops: string;
  xrp: string;
}

export interface WalletNetwork {
  network: string;
  serverUrl: string;
  walletAddress: string;
}

export interface WalletInfoData {
  network: WalletNetwork;
  balance: WalletBalance;
  connected: boolean;
  clientConnected: boolean;
}

export interface WalletInfoResponse {
  success: boolean;
  data: WalletInfoData;
  message: string;
}

export interface SystemServices {
  api: string;
  xrpl: string;
  database: string;
}

export interface XRPLInfo {
  connected: boolean;
  walletConfigured: boolean;
  network: string;
}

export interface DatabaseInfo {
  connected: boolean;
  responseTime: number;
}

export interface DetailedHealthData {
  message: string;
  timestamp: string;
  version: string;
  environment: string;
  services: SystemServices;
  xrpl: XRPLInfo;
  database: DatabaseInfo;
}

export interface DetailedHealthResponse {
  success: boolean;
  data: DetailedHealthData;
}

@Injectable({
  providedIn: 'root'
})
export class DataApiService {
  private baseUrl = 'http://localhost:3004/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // NFT Data Endpoints
  getNFTById(nftId: string): Observable<NFTDetailsResponse> {
    return this.http.get<NFTDetailsResponse>(`${this.baseUrl}/nft/${nftId}`, {
      headers: this.getHeaders()
    });
  }

  getAccountNFTs(account: string, limit: number = 20, offset: number = 0): Observable<AccountNFTsResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    
    return this.http.get<AccountNFTsResponse>(`${this.baseUrl}/nft/account/${account}`, {
      headers: this.getHeaders(),
      params
    });
  }

  // Statistics and Analytics Endpoints
  getNFTStatistics(): Observable<NFTStatsResponse> {
    return this.http.get<NFTStatsResponse>(`${this.baseUrl}/stats/nft`, {
      headers: this.getHeaders()
    });
  }

  // System Information Endpoints
  getWalletInfo(): Observable<WalletInfoResponse> {
    return this.http.get<WalletInfoResponse>(`${this.baseUrl}/nft/wallet/info`, {
      headers: this.getHeaders()
    });
  }

  getDetailedHealth(): Observable<DetailedHealthResponse> {
    return this.http.get<DetailedHealthResponse>(`${this.baseUrl}/health/detailed`, {
      headers: this.getHeaders()
    });
  }

  // Basic health check
  getHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`, {
      headers: this.getHeaders()
    });
  }

  // Generic API call method for testing
  makeApiCall(endpoint: string): Observable<any> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // Utility methods for data analysis
  calculateCollectionAnalytics(stats: NFTStatistics) {
    return {
      overview: {
        totalNFTs: stats.totalNFTs,
        activeNFTs: stats.activeNFTs,
        burnedNFTs: stats.burnedNFTs,
        burnRate: stats.totalNFTs > 0 ? (stats.burnedNFTs / stats.totalNFTs * 100).toFixed(2) : '0.00'
      },
      growth: {
        recentMints: stats.recentMints,
        totalAccounts: stats.totalAccounts,
        avgNFTsPerAccount: stats.totalAccounts > 0 ? (stats.totalNFTs / stats.totalAccounts).toFixed(2) : '0.00'
      }
    };
  }

  // Format XRP balance for display
  formatBalance(drops: string): string {
    const dropsNum = parseInt(drops);
    const xrp = dropsNum / 1000000;
    return xrp.toFixed(6) + ' XRP';
  }

  // Validate NFT ID format
  isValidNFTId(nftId: string): boolean {
    return /^[0-9A-Fa-f]{64}$/.test(nftId);
  }

  // Validate XRPL address format
  isValidXRPLAddress(address: string): boolean {
    return /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(address);
  }
}
