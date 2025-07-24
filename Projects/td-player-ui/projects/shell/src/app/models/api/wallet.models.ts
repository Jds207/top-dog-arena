import { XRPLNetwork, BackendStatus } from '../base-types';

// Wallet Information Models
export interface WalletInfo {
  address: string;
  balance: string;
  network: XRPLNetwork;
  isActive: boolean;
  lastUpdated: string;
  sequence?: number;
  reserve?: string;
  ownerReserve?: string;
}

// API Request Models
export interface CreateWalletRequest {
  network?: XRPLNetwork;
  seed?: string;
}

export interface FundWalletRequest {
  address: string;
  amount: number;
  network?: XRPLNetwork;
}

export interface SyncBalanceRequest {
  address: string;
  network?: XRPLNetwork;
}

// API Response Models
export interface CreateWalletResponse {
  success: boolean;
  data: {
    address: string;
    secret: string;
    publicKey: string;
    privateKey: string;
    classicAddress: string;
    seed: string;
    balance?: string;
    network?: XRPLNetwork;
  };
  message?: string;
}

export interface FundWalletResponse {
  success: boolean;
  data: {
    address: string;
    amount: number;
    txHash?: string;
    balance: string;
    network: XRPLNetwork;
  };
  message?: string;
}

export interface WalletDetailsResponse {
  success: boolean;
  data: {
    address: string;
    balance: string | number;
    network: XRPLNetwork;
    sequence?: number;
    reserve?: string;
    ownerReserve?: string;
    lastActivity?: string;
  };
  message?: string;
}

export interface WalletListResponse {
  success: boolean;
  data: {
    wallets: WalletInfo[];
    totalCount: number;
    page?: number;
    limit?: number;
  };
  message?: string;
}

export interface SyncBalanceResponse {
  success: boolean;
  data: {
    address: string;
    oldBalance: string;
    newBalance: string;
    network: XRPLNetwork;
    lastSync: string;
  };
  message?: string;
}

export interface WalletStatsResponse {
  success: boolean;
  data: {
    totalWallets: number;
    totalBalance: string;
    activeWallets: number;
    networks: {
      testnet: number;
      mainnet: number;
      devnet: number;
    };
  };
  message?: string;
}

// Validation Models
export interface AddressValidationResponse {
  valid: boolean;
  address?: string;
  network?: XRPLNetwork;
  message?: string;
}

// Balance Models (for backward compatibility)
export interface BalanceObject {
  balance: string;
  available: string;
  reserved: string;
}

export interface LegacyBalance {
  available: string;
  reserved: string;
}
