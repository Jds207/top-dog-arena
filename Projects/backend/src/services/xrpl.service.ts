import { Client, Wallet, NFTokenMint, xrpToDrops } from 'xrpl';
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

      // Initialize wallet (optional for testing)
      if (!this.config.walletSeed) {
        logger.warn('⚠️ XRPL wallet seed not provided - some features will be disabled');
        return;
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
   * Get balance of any XRPL address in XRP (not drops)
   */
  async getBalance(address: string): Promise<string> {
    if (!this.client) {
      throw new Error('XRPL service not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });

      const balanceDrops = response.result.account_data.Balance;
      const balanceXRP = (parseInt(balanceDrops) / 1000000).toString(); // Convert drops to XRP
      
      return balanceXRP;
    } catch (error) {
      logger.error(`❌ Error getting balance for ${address}:`, error);
      return '0'; // Return 0 if account doesn't exist or other error
    }
  }

  /**
   * Send XRP from one address to another
   */
  async sendXRP(fromAddress: string, toAddress: string, amount: string): Promise<{
    success: boolean;
    transactionHash?: string;
    error?: string;
  }> {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL service not initialized');
    }

    // Only allow sending from our own wallet for security
    if (fromAddress !== this.wallet.address) {
      return {
        success: false,
        error: 'Can only send XRP from service wallet for security'
      };
    }

    try {
      const payment: any = {
        TransactionType: 'Payment',
        Account: fromAddress,
        Amount: (parseFloat(amount) * 1000000).toString(), // Convert XRP to drops
        Destination: toAddress
      };

      const prepared = await this.client.autofill(payment);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta && typeof result.result.meta !== 'string' && result.result.meta.TransactionResult === 'tesSUCCESS') {
        logger.info(`💸 Sent ${amount} XRP from ${fromAddress} to ${toAddress}`);
        return {
          success: true,
          transactionHash: signed.hash
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed'
        };
      }
    } catch (error) {
      logger.error('❌ Error sending XRP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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

      const validatedLedger = response.result.info.validated_ledger;
      if (!validatedLedger) {
        throw new Error('No validated ledger info available');
      }

      const baseReserve = validatedLedger.reserve_base_xrp;
      const ownerReserve = validatedLedger.reserve_inc_xrp;

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
        (mintTransaction as any).Destination = request.recipient;
      }

      // Note: validateNFTokenMint is not available in current XRPL version
      // Basic validation will be done by the XRPL client

      // Submit and wait for validation
      const response = await this.client.submitAndWait(mintTransaction, {
        wallet: this.wallet
      });

      if ((response.result.meta as any)?.TransactionResult === 'tesSUCCESS') {
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
        logger.error(`❌ NFT mint failed: ${(response.result.meta as any)?.TransactionResult}`);
        
        return {
          success: false,
          error: (response.result.meta as any)?.TransactionResult || 'Unknown error'
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
   * Create a new XRPL wallet
   */
  async createWallet(): Promise<{
    address: string;
    seed: string;
    publicKey: string;
    privateKey: string;
  }> {
    try {
      // Generate a new wallet
      const newWallet = Wallet.generate();
      
      logger.info(`🏦 Generated new XRPL wallet: ${newWallet.address}`);
      
      return {
        address: newWallet.address,
        seed: newWallet.seed || '',
        publicKey: newWallet.publicKey,
        privateKey: newWallet.privateKey,
      };
    } catch (error) {
      logger.error('❌ Error creating new wallet:', error);
      throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fund a wallet from testnet faucet (testnet only)
   */
  async fundWallet(address: string): Promise<{
    success: boolean;
    balance?: string;
    error?: string;
    fundedAddress?: string;
    fundedSeed?: string;
  }> {
    try {
      if (this.config.network !== 'testnet') {
        return {
          success: false,
          error: 'Wallet funding is only available on testnet'
        };
      }

      // Ensure client is connected
      if (!this.client) {
        await this.initialize();
      }

      if (!this.client) {
        return {
          success: false,
          error: 'Failed to connect to XRPL network'
        };
      }

      // For now, just use the faucet method since it works reliably
      logger.info(`💰 Using testnet faucet to fund wallet: ${address}`);
      logger.info('🚀 ABOUT TO CALL FAUCET - Enhanced logging active');
      const fundResult = await this.client.fundWallet();
      logger.info('🎯 FAUCET CALL COMPLETED - Processing response');
      
      // Log the complete raw faucet response for debugging
      logger.info(`🔍 FULL TESTNET FAUCET RESPONSE: ${JSON.stringify({
        requestedAddress: address,
        fullResponse: fundResult,
        fundResultStringified: JSON.stringify(fundResult, null, 2)
      }, null, 2)}`);
      
      if (fundResult?.wallet?.address) {
        logger.info(`💰 Funded wallet ${fundResult.wallet.address} with ${fundResult.balance} XRP`);
        
        // Log wallet details for verification
        logger.info(`✅ FUNDED WALLET DETAILS: ${JSON.stringify({
          requestedAddress: address,
          actualFundedAddress: fundResult.wallet.address,
          balance: fundResult.balance?.toString(),
          seed: fundResult.wallet.seed ? '[SEED PROVIDED]' : '[NO SEED]',
          balanceDrops: fundResult.balance,
          walletClassicAddress: fundResult.wallet.classicAddress,
          walletPublicKey: fundResult.wallet.publicKey ? '[PUBLIC KEY PROVIDED]' : '[NO PUBLIC KEY]'
        }, null, 2)}`);
        
        // Return the actual funded wallet address (not the requested one)
        return {
          success: true,
          balance: fundResult.balance?.toString(),
          fundedAddress: fundResult.wallet.address,
          fundedSeed: fundResult.wallet.seed
        };
      } else {
        logger.error(`❌ FAUCET FUNDING FAILED - No wallet in response: ${JSON.stringify({
          requestedAddress: address,
          fundResult: fundResult,
          hasWallet: !!fundResult?.wallet,
          hasAddress: !!fundResult?.wallet?.address
        }, null, 2)}`);
        return {
          success: false,
          error: 'Failed to fund wallet from faucet'
        };
      }
      
    } catch (error) {
      logger.error(`❌ FAUCET ERROR - Complete error details: ${JSON.stringify({
        requestedAddress: address,
        error: error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: typeof error,
        networkConfig: this.config.network
      }, null, 2)}`);
      return {
        success: false,
        error: `Failed to fund wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if an address is a valid XRPL address
   */
  isValidXRPLAddress(address: string): boolean {
    try {
      // XRPL addresses start with 'r' and are 25-34 characters long
      const addressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
      return addressRegex.test(address);
    } catch (error) {
      return false;
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
