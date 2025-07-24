/**
 * Base types and enums used throughout the application
 */

// Network types
export type XRPLNetwork = 'testnet' | 'mainnet' | 'devnet';

// Status types
export type BackendStatus = 'checking' | 'online' | 'offline' | 'error';
export type XRPLStatus = 'checking' | 'connected' | 'disconnected' | 'error';
export type ServiceStatus = 'healthy' | 'unhealthy';
export type ConnectionStatus = 'connected' | 'disconnected' | 'not_configured' | 'error';

// Wallet connection methods
export type WalletConnectionMethod = 'manual' | 'xumm' | 'metamask';

// NFT trait value types
export type NFTTraitValue = string | number;

// Balance formats
export interface BalanceObject {
  drops: string;
  xrp: string;
}

// Legacy balance format (for backward compatibility)
export interface LegacyBalance {
  balance: string;
  available: string;
}

// Common response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
  error?: string;
}

// Common error response
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
}

// Validation error response
export interface ValidationErrorResponse extends ErrorResponse {
  details: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Rate limit error response
export interface RateLimitErrorResponse extends ErrorResponse {
  retryAfter: string;
}

// Not implemented response
export interface NotImplementedResponse {
  success: false;
  message: string;
  timestamp: string;
}
