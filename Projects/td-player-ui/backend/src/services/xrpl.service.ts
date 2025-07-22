import { Client, Wallet, NFTokenMint, validateNFTokenMint, xrpToDrops } from 'xrpl';
import { logger } from '../utils/logger';

export interface XRPLConfig {
  serverUrl: string;
  walletSeed: string;
  network: 'mainnet' | 'testnet' | 'devnet';
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface MintNFTRequest {
  metadata: NFTMetadata;
  transferFee?: number; // 0-50000 (0-50%)
  flags?: number;
  recipient?: string;
}

export interface MintNFTResult {
  success: boolean;
  txHash?: string;
  nftId?: string;
  error?: string;
  fee?: string;
}

class XRPLService {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private config: XRPLConfig;

  constructor() {
    this.config = {
      serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
      walletSeed: process.env.XRPL_WALLET_SEED || '',
      network: (process.env.XRPL_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet',
    };
  }

  /**
   * Initialize XRPL client and wallet
   */
  async initialize(): Promise<void> {
    try {
      // Create XRPL client
      this.client = new Client(this.config.serverUrl);
      await this.client.connect();
      logger.info(`✅ Connected to XRPL ${this.config.network}`);

      // Initialize wallet
      if (!this.config.walletSeed) {
        throw new Error('XRPL wallet seed not provided');
      }

      this.wallet = Wallet.fromSeed(this.config.walletSeed);
      logger.info(`✅ XRPL wallet initialized: ${this.wallet.address}`);

      // Verify wallet has sufficient balance
      await this.checkWalletBalance();

    } catch (error) {
      logger.error('❌ Failed to initialize XRPL service:', error);
      throw error;
    }
  }

  /**
   * Check wallet balance and reserve requirements
   */
  async checkWalletBalance(): Promise<{ balance: string; available: string }> {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL service not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: this.wallet.address,
        ledger_index: 'validated'
      });

      const balance = response.result.account_data.Balance;
      const reserve = await this.getAccountReserve();
      const available = (parseInt(balance) - reserve).toString();

      logger.info(`💰 Wallet balance: ${balance} drops (${available} available)`);

      return {
        balance: balance,
        available: available
      };
    } catch (error) {
      logger.error('❌ Failed to check wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get account reserve requirements
   */
  async getAccountReserve(): Promise<number> {
    if (!this.client) {
      throw new Error('XRPL client not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'server_info'
      });

      const baseReserve = response.result.info.validated_ledger.reserve_base_xrp;
      const ownerReserve = response.result.info.validated_ledger.reserve_inc_xrp;

      // Calculate reserve (base + owner count * owner reserve)
      return parseInt(xrpToDrops(baseReserve + ownerReserve));
    } catch (error) {
      logger.error('❌ Failed to get account reserve:', error);
      return 20000000; // Default 20 XRP reserve
    }
  }

  /**
   * Mint an NFT on XRPL
   */
  async mintNFT(request: MintNFTRequest): Promise<MintNFTResult> {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL service not initialized');
    }

    try {
      logger.info(`🎨 Minting NFT: ${request.metadata.name}`);

      // Prepare NFTokenMint transaction
      const mintTransaction: NFTokenMint = {
        TransactionType: 'NFTokenMint',
        Account: this.wallet.address,
        URI: this.convertStringToHex(JSON.stringify(request.metadata)),
        Flags: request.flags || 8, // tfTransferable flag
        TransferFee: request.transferFee || 0,
        NFTokenTaxon: 0 // Can be used for categorization
      };

      // Add destination if specified
      if (request.recipient) {
        mintTransaction.Destination = request.recipient;
      }

      // Validate transaction
      validateNFTokenMint(mintTransaction);

      // Submit and wait for validation
      const response = await this.client.submitAndWait(mintTransaction, {
        wallet: this.wallet
      });

      if (response.result.meta?.TransactionResult === 'tesSUCCESS') {
        // Extract NFT ID from metadata
        const nftId = this.extractNFTIdFromMeta(response.result.meta);
        
        logger.info(`✅ NFT minted successfully: ${nftId}`);
        
        return {
          success: true,
          txHash: response.result.hash,
          nftId: nftId,
          fee: response.result.Fee
        };
      } else {
        logger.error(`❌ NFT mint failed: ${response.result.meta?.TransactionResult}`);
        
        return {
          success: false,
          error: response.result.meta?.TransactionResult || 'Unknown error'
        };
      }

    } catch (error) {
      logger.error('❌ Error minting NFT:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get NFT details by ID
   */
  async getNFTDetails(nftId: string): Promise<any> {
    if (!this.client) {
      throw new Error('XRPL client not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'nft_info',
        nft_id: nftId
      });

      return response.result;
    } catch (error) {
      logger.error(`❌ Failed to get NFT details for ${nftId}:`, error);
      throw error;
    }
  }

  /**
   * Get all NFTs owned by an account
   */
  async getAccountNFTs(account: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('XRPL client not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'account_nfts',
        account: account
      });

      return response.result.account_nfts || [];
    } catch (error) {
      logger.error(`❌ Failed to get NFTs for account ${account}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from XRPL
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.wallet = null;
      logger.info('✅ Disconnected from XRPL');
    }
  }

  /**
   * Utility: Convert string to hex
   */
  private convertStringToHex(str: string): string {
    return Buffer.from(str, 'utf8').toString('hex').toUpperCase();
  }

  /**
   * Utility: Extract NFT ID from transaction metadata
   */
  private extractNFTIdFromMeta(meta: any): string | undefined {
    if (meta?.CreatedNode?.NewFields?.NFTokens) {
      const nfts = meta.CreatedNode.NewFields.NFTokens;
      if (nfts.length > 0) {
        return nfts[0].NFToken?.NFTokenID;
      }
    }
    
    // Alternative extraction method
    if (meta?.AffectedNodes) {
      for (const node of meta.AffectedNodes) {
        if (node.CreatedNode?.LedgerEntryType === 'NFTokenPage') {
          const nfts = node.CreatedNode.NewFields?.NFTokens;
          if (nfts && nfts.length > 0) {
            return nfts[nfts.length - 1].NFToken?.NFTokenID;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Get current network info
   */
  getNetworkInfo(): { network: string; serverUrl: string; walletAddress: string | null } {
    return {
      network: this.config.network,
      serverUrl: this.config.serverUrl,
      walletAddress: this.wallet?.address || null
    };
  }
}

// Export singleton instance
export const xrplService = new XRPLService();

// Initialize function for server startup
export async function initializeXRPL(): Promise<void> {
  await xrplService.initialize();
}

export default xrplService;
