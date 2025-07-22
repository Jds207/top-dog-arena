/**
 * Top Dog Arena API Helper for AI Assistants
 * 
 * This helper provides typed interfaces and utility functions for AI assistants
 * to interact with the Top Dog Arena NFT API.
 */

// Base configuration
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
  environment?: string;
  services?: {
    api: 'healthy' | 'unhealthy';
    xrpl: 'connected' | 'disconnected' | 'not_configured' | 'error';
    database: 'connected' | 'disconnected' | 'not_configured' | 'error';
  };
}

export interface XRPLStatus {
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

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface CreateNFTRequest extends NFTMetadata {
  transferFee?: number;
  recipient?: string;
  flags?: number;
}

export interface NFTCreatedData {
  nftId: string;
  txHash: string;
  fee: string;
  metadata: NFTMetadata;
}

/**
 * Top Dog Arena API Client for AI Assistants
 */
export class TopDogArenaAPI {
  private config: ApiConfig;

  constructor(config: ApiConfig = { baseUrl: 'http://localhost:3000/api' }) {
    this.config = config;
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        timeout: this.config.timeout || 30000,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          message: data.message || response.statusText,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to connect to API',
      };
    }
  }

  /**
   * Check if API is online and responsive
   */
  async checkConnectivity(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>('/health');
  }

  /**
   * Get detailed health information including service status
   */
  async getDetailedHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>('/health/detailed');
  }

  /**
   * Get XRPL connection and wallet status
   */
  async getXRPLStatus(): Promise<ApiResponse<XRPLStatus>> {
    return this.request<XRPLStatus>('/health/xrpl');
  }

  /**
   * Get wallet information and configuration
   */
  async getWalletInfo(): Promise<ApiResponse<any>> {
    return this.request('/nft/wallet/info');
  }

  /**
   * Create a single NFT
   */
  async createNFT(nftData: CreateNFTRequest): Promise<ApiResponse<NFTCreatedData>> {
    return this.request<NFTCreatedData>('/nft/create', {
      method: 'POST',
      body: JSON.stringify(nftData),
    });
  }

  /**
   * Create multiple NFTs in batch (max 10)
   */
  async batchCreateNFTs(nfts: CreateNFTRequest[]): Promise<ApiResponse<any>> {
    if (nfts.length > 10) {
      return {
        success: false,
        error: 'Maximum 10 NFTs per batch',
        message: 'Batch size exceeds limit',
      };
    }

    return this.request('/nft/batch-create', {
      method: 'POST',
      body: JSON.stringify({ nfts }),
    });
  }

  /**
   * Get NFT details by ID
   */
  async getNFT(nftId: string): Promise<ApiResponse<any>> {
    if (!/^[0-9A-Fa-f]{64}$/.test(nftId)) {
      return {
        success: false,
        error: 'Invalid NFT ID format',
        message: 'NFT ID must be 64-character hexadecimal string',
      };
    }

    return this.request(`/nft/${nftId}`);
  }

  /**
   * Get all NFTs owned by an account
   */
  async getAccountNFTs(account: string, limit?: number, marker?: string): Promise<ApiResponse<any>> {
    if (!/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(account)) {
      return {
        success: false,
        error: 'Invalid XRPL address format',
        message: 'Account must be a valid XRPL address',
      };
    }

    const params = new URLSearchParams();
    if (limit) params.set('limit', limit.toString());
    if (marker) params.set('marker', marker);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/nft/account/${account}${query}`);
  }

  /**
   * Test all endpoints and return connectivity status
   */
  async runConnectivityTests(): Promise<{
    api: boolean;
    xrpl: boolean;
    nftService: boolean;
    details: Record<string, any>;
  }> {
    const results = {
      api: false,
      xrpl: false,
      nftService: false,
      details: {} as Record<string, any>,
    };

    // Test basic connectivity
    const healthCheck = await this.checkConnectivity();
    results.api = healthCheck.success;
    results.details.health = healthCheck;

    // Test XRPL status
    const xrplStatus = await this.getXRPLStatus();
    results.xrpl = xrplStatus.success && xrplStatus.data?.xrpl?.connected;
    results.details.xrpl = xrplStatus;

    // Test NFT service
    const walletInfo = await this.getWalletInfo();
    results.nftService = walletInfo.success;
    results.details.wallet = walletInfo;

    return results;
  }
}

// Example usage for AI assistants
export const examples = {
  /**
   * Basic connectivity test
   */
  async testConnection() {
    const api = new TopDogArenaAPI();
    const status = await api.runConnectivityTests();
    
    console.log('API Connectivity:', status.api ? '✅ Online' : '❌ Offline');
    console.log('XRPL Status:', status.xrpl ? '✅ Connected' : '⚠️ Not configured');
    console.log('NFT Service:', status.nftService ? '✅ Ready' : '⚠️ Not configured');
    
    return status;
  },

  /**
   * Create a baseball card NFT
   */
  async createBaseballCard(playerName: string, team: string, rarity: string = 'Common') {
    const api = new TopDogArenaAPI();
    
    const nftData: CreateNFTRequest = {
      name: `${playerName} - ${team} Baseball Card`,
      description: `A ${rarity.toLowerCase()} baseball card featuring ${playerName} from ${team}.`,
      image: `https://topdogarena.com/images/cards/${playerName.toLowerCase().replace(' ', '-')}.png`,
      attributes: [
        { trait_type: 'Player', value: playerName },
        { trait_type: 'Team', value: team },
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Sport', value: 'Baseball' },
        { trait_type: 'Year', value: 2025 },
      ],
      external_url: `https://topdogarena.com/players/${playerName.toLowerCase().replace(' ', '-')}`,
      transferFee: rarity === 'Legendary' ? 1000 : rarity === 'Rare' ? 500 : 250,
    };

    return api.createNFT(nftData);
  },

  /**
   * Check account NFTs
   */
  async checkPlayerCollection(xrplAddress: string) {
    const api = new TopDogArenaAPI();
    return api.getAccountNFTs(xrplAddress, 50);
  },
};

// Export default instance
export default new TopDogArenaAPI();

// Types for AI assistant responses
export type ConnectivityStatus = 'online' | 'offline' | 'partial';
export type XRPLReadiness = 'ready' | 'not_configured' | 'error';
export type NFTServiceStatus = 'available' | 'unavailable' | 'error';

/**
 * Helper function for AI assistants to get a quick status summary
 */
export async function getAPISummary(): Promise<{
  status: ConnectivityStatus;
  xrpl: XRPLReadiness;
  nftService: NFTServiceStatus;
  message: string;
  capabilities: string[];
}> {
  const api = new TopDogArenaAPI();
  const tests = await api.runConnectivityTests();
  
  const capabilities = [];
  if (tests.api) capabilities.push('Health monitoring');
  if (tests.xrpl) capabilities.push('XRPL integration', 'NFT creation');
  if (tests.nftService) capabilities.push('Wallet management', 'NFT queries');
  
  let status: ConnectivityStatus = 'offline';
  if (tests.api && tests.xrpl && tests.nftService) status = 'online';
  else if (tests.api) status = 'partial';
  
  const xrpl: XRPLReadiness = tests.xrpl ? 'ready' : 'not_configured';
  const nftService: NFTServiceStatus = tests.nftService ? 'available' : 'unavailable';
  
  const message = status === 'online' 
    ? 'All systems operational - ready to create NFTs'
    : status === 'partial'
    ? 'API online but XRPL wallet not configured'
    : 'API is offline';
  
  return { status, xrpl, nftService, message, capabilities };
}
