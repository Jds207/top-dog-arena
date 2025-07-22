"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xrplService = void 0;
exports.initializeXRPL = initializeXRPL;
const xrpl_1 = require("xrpl");
const logger_1 = require("../utils/logger");
class XRPLService {
    client = null;
    wallet = null;
    config;
    constructor() {
        this.config = {
            serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
            walletSeed: process.env.XRPL_WALLET_SEED || '',
            network: process.env.XRPL_NETWORK || 'testnet',
        };
    }
    /**
     * Initialize XRPL client and wallet
     */
    async initialize() {
        try {
            // Create XRPL client
            this.client = new xrpl_1.Client(this.config.serverUrl);
            await this.client.connect();
            logger_1.logger.info(`✅ Connected to XRPL ${this.config.network}`);
            // Initialize wallet (optional for testing)
            if (!this.config.walletSeed) {
                logger_1.logger.warn('⚠️ XRPL wallet seed not provided - some features will be disabled');
                return;
            }
            this.wallet = xrpl_1.Wallet.fromSeed(this.config.walletSeed);
            logger_1.logger.info(`✅ XRPL wallet initialized: ${this.wallet.address}`);
            // Verify wallet has sufficient balance
            await this.checkWalletBalance();
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to initialize XRPL service:', error);
            throw error;
        }
    }
    /**
     * Check wallet balance and reserve requirements
     */
    async checkWalletBalance() {
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
            logger_1.logger.info(`💰 Wallet balance: ${balance} drops (${available} available)`);
            return {
                balance: balance,
                available: available
            };
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to check wallet balance:', error);
            throw error;
        }
    }
    /**
     * Get account reserve requirements
     */
    async getAccountReserve() {
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
            return parseInt((0, xrpl_1.xrpToDrops)(baseReserve + ownerReserve));
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to get account reserve:', error);
            return 20000000; // Default 20 XRP reserve
        }
    }
    /**
     * Mint an NFT on XRPL
     */
    async mintNFT(request) {
        if (!this.client || !this.wallet) {
            throw new Error('XRPL service not initialized');
        }
        try {
            logger_1.logger.info(`🎨 Minting NFT: ${request.metadata.name}`);
            // Prepare NFTokenMint transaction
            const mintTransaction = {
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
            // Note: validateNFTokenMint is not available in current XRPL version
            // Basic validation will be done by the XRPL client
            // Submit and wait for validation
            const response = await this.client.submitAndWait(mintTransaction, {
                wallet: this.wallet
            });
            if (response.result.meta?.TransactionResult === 'tesSUCCESS') {
                // Extract NFT ID from metadata
                const nftId = this.extractNFTIdFromMeta(response.result.meta);
                logger_1.logger.info(`✅ NFT minted successfully: ${nftId}`);
                return {
                    success: true,
                    txHash: response.result.hash,
                    nftId: nftId,
                    fee: response.result.Fee
                };
            }
            else {
                logger_1.logger.error(`❌ NFT mint failed: ${response.result.meta?.TransactionResult}`);
                return {
                    success: false,
                    error: response.result.meta?.TransactionResult || 'Unknown error'
                };
            }
        }
        catch (error) {
            logger_1.logger.error('❌ Error minting NFT:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Get NFT details by ID
     */
    async getNFTDetails(nftId) {
        if (!this.client) {
            throw new Error('XRPL client not initialized');
        }
        try {
            const response = await this.client.request({
                command: 'nft_info',
                nft_id: nftId
            });
            return response.result;
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get NFT details for ${nftId}:`, error);
            throw error;
        }
    }
    /**
     * Get all NFTs owned by an account
     */
    async getAccountNFTs(account) {
        if (!this.client) {
            throw new Error('XRPL client not initialized');
        }
        try {
            const response = await this.client.request({
                command: 'account_nfts',
                account: account
            });
            return response.result.account_nfts || [];
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get NFTs for account ${account}:`, error);
            throw error;
        }
    }
    /**
     * Disconnect from XRPL
     */
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.client = null;
            this.wallet = null;
            logger_1.logger.info('✅ Disconnected from XRPL');
        }
    }
    /**
     * Utility: Convert string to hex
     */
    convertStringToHex(str) {
        return Buffer.from(str, 'utf8').toString('hex').toUpperCase();
    }
    /**
     * Utility: Extract NFT ID from transaction metadata
     */
    extractNFTIdFromMeta(meta) {
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
    getNetworkInfo() {
        return {
            network: this.config.network,
            serverUrl: this.config.serverUrl,
            walletAddress: this.wallet?.address || null
        };
    }
}
// Export singleton instance
exports.xrplService = new XRPLService();
// Initialize function for server startup
async function initializeXRPL() {
    await exports.xrplService.initialize();
}
exports.default = exports.xrplService;
//# sourceMappingURL=xrpl.service.js.map