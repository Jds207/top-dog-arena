"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const xrpl_1 = require("xrpl");
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const database_service_1 = require("./services/database.service");
const songbird_service_1 = require("./services/songbird.service");
// Load environment variables
dotenv_1.default.config();
// Create simple logger
const logger = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args)
};
// Real XRPL Service
class RealXRPLService {
    client = null;
    wallet = null;
    connected = false;
    balance = null;
    async initialize() {
        try {
            const serverUrl = process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233';
            logger.info(`🔗 Connecting to XRPL: ${serverUrl}`);
            // Create and connect XRPL client
            this.client = new xrpl_1.Client(serverUrl);
            await this.client.connect();
            logger.info(`✅ Connected to XRPL ${process.env.XRPL_NETWORK || 'testnet'}`);
            // Initialize wallet if seed is provided
            if (process.env.XRPL_WALLET_SEED) {
                this.wallet = xrpl_1.Wallet.fromSeed(process.env.XRPL_WALLET_SEED);
                logger.info(`✅ XRPL wallet initialized: ${this.wallet.address}`);
                // Check wallet balance
                await this.updateBalance();
                this.connected = true;
            }
            else {
                logger.warn('⚠️ XRPL_WALLET_SEED not configured');
            }
        }
        catch (error) {
            logger.error('❌ XRPL connection failed:', error);
            this.connected = false;
        }
    }
    async updateBalance() {
        if (!this.client || !this.wallet)
            return;
        try {
            const response = await this.client.request({
                command: 'account_info',
                account: this.wallet.address,
                ledger_index: 'validated'
            });
            this.balance = response.result.account_data.Balance;
            const xrpBalance = (parseInt(this.balance) / 1000000).toFixed(6);
            logger.info(`💰 Wallet balance: ${xrpBalance} XRP (${this.balance} drops)`);
        }
        catch (error) {
            logger.error('❌ Failed to get wallet balance:', error);
            this.balance = 'error';
        }
    }
    async createNFT(metadata) {
        if (!this.client || !this.wallet || !this.connected) {
            throw new Error('XRPL service not connected');
        }
        try {
            // Create NFT metadata URI (in real implementation, upload to IPFS)
            const metadataJson = JSON.stringify({
                name: metadata.name,
                description: metadata.description,
                image: metadata.imageUrl,
                attributes: metadata.attributes || []
            });
            // Convert metadata to hex for XRPL
            const uriHex = Buffer.from(metadataJson, 'utf8').toString('hex').toUpperCase();
            // Create NFTokenMint transaction
            const nftMintTx = {
                TransactionType: 'NFTokenMint',
                Account: this.wallet.address,
                URI: uriHex,
                Flags: 8, // tfTransferable
                TransferFee: 0, // No transfer fee
                NFTokenTaxon: 0
            };
            logger.info('🎨 Minting NFT on XRPL...');
            // Submit and wait for validation
            const response = await this.client.submitAndWait(nftMintTx, { wallet: this.wallet });
            if (response.result.meta && typeof response.result.meta === 'object' && 'TransactionResult' in response.result.meta) {
                if (response.result.meta.TransactionResult === 'tesSUCCESS') {
                    // Extract NFToken ID from transaction metadata
                    const meta = response.result.meta;
                    let nftokenId = null;
                    // First, check if there's a direct nftoken_id in metadata
                    if (meta.nftoken_id) {
                        nftokenId = meta.nftoken_id;
                        logger.info('🎯 Found NFTokenID in metadata:', nftokenId);
                    }
                    else {
                        // Look for NFToken in modified NFTokenPage nodes
                        const modifiedNodes = meta.AffectedNodes?.filter((node) => node.ModifiedNode?.LedgerEntryType === 'NFTokenPage');
                        if (modifiedNodes && modifiedNodes.length > 0) {
                            const modifiedNode = modifiedNodes[0];
                            const finalFields = modifiedNode.ModifiedNode?.FinalFields;
                            const previousFields = modifiedNode.ModifiedNode?.PreviousFields;
                            if (finalFields?.NFTokens && previousFields?.NFTokens) {
                                // Find the new NFToken by comparing arrays
                                const finalTokens = finalFields.NFTokens;
                                const previousTokens = previousFields.NFTokens;
                                if (finalTokens.length > previousTokens.length) {
                                    // The new token should be the last one in the final list
                                    const newToken = finalTokens[finalTokens.length - 1];
                                    nftokenId = newToken.NFToken?.NFTokenID;
                                    logger.info('🎯 Found NFTokenID in modified node:', nftokenId);
                                }
                            }
                        }
                        // Fallback: look in created nodes
                        if (!nftokenId) {
                            const createdNodes = meta.AffectedNodes?.filter((node) => node.CreatedNode?.LedgerEntryType === 'NFTokenPage');
                            if (createdNodes && createdNodes.length > 0) {
                                const nftTokenPage = createdNodes[0];
                                const newFields = nftTokenPage.CreatedNode?.NewFields;
                                if (newFields?.NFTokens && newFields.NFTokens.length > 0) {
                                    nftokenId = newFields.NFTokens[0].NFToken?.NFTokenID;
                                    logger.info('🎯 Found NFTokenID in created node:', nftokenId);
                                }
                            }
                        }
                    }
                    logger.info('🎯 Final extracted NFTokenID:', nftokenId);
                    await this.updateBalance(); // Update balance after transaction
                    return {
                        success: true,
                        txHash: response.result.hash,
                        nftId: nftokenId,
                        account: this.wallet.address,
                        metadata: metadataJson,
                        fee: response.result.Fee
                    };
                }
                else {
                    throw new Error(`Transaction failed: ${response.result.meta.TransactionResult}`);
                }
            }
            else {
                throw new Error('Invalid transaction response');
            }
        }
        catch (error) {
            logger.error('❌ NFT minting failed:', error);
            throw error;
        }
    }
    isConnected() {
        return this.connected && this.client?.isConnected() === true;
    }
    getWalletInfo() {
        return {
            address: this.wallet?.address || null,
            balance: this.balance,
            connected: this.isConnected(),
            client: this.client?.isConnected() || false
        };
    }
    async createWallet() {
        try {
            // Generate a new wallet
            const newWallet = xrpl_1.Wallet.generate();
            logger.info(`🏦 Generated new XRPL wallet: ${newWallet.address}`);
            return {
                address: newWallet.address,
                seed: newWallet.seed || '',
                publicKey: newWallet.publicKey,
                privateKey: newWallet.privateKey,
            };
        }
        catch (error) {
            logger.error('❌ Error creating new wallet:', error);
            throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fundWallet(address) {
        try {
            if (!this.client) {
                throw new Error('XRPL client not connected');
            }
            // Fund the wallet using XRPL library's fundWallet method
            const fundResult = await this.client.fundWallet();
            if (fundResult?.wallet?.address) {
                logger.info(`💰 Funded wallet ${fundResult.wallet.address} with ${fundResult.balance} XRP`);
                return {
                    success: true,
                    balance: fundResult.balance?.toString()
                };
            }
            else {
                return {
                    success: false,
                    error: 'Failed to fund wallet from faucet'
                };
            }
        }
        catch (error) {
            logger.error('❌ Error funding wallet:', error);
            return {
                success: false,
                error: `Failed to fund wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getAccountBalance(address) {
        if (!this.client)
            return null;
        try {
            const response = await this.client.request({
                command: 'account_info',
                account: address,
                ledger_index: 'validated'
            });
            const balance = response.result.account_data.Balance;
            const balanceXRP = (parseInt(balance) / 1000000).toFixed(6);
            return { balance, balanceXRP };
        }
        catch (error) {
            logger.info(`Account ${address} not found or unfunded:`, error);
            return null;
        }
    }
    isValidXRPLAddress(address) {
        try {
            // XRPL addresses start with 'r' and are 25-34 characters long
            const addressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
            return addressRegex.test(address);
        }
        catch (error) {
            return false;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            logger.info('🔌 Disconnected from XRPL');
        }
    }
}
const xrplService = new RealXRPLService();
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure multer for image uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Basic middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Load OpenAPI specification
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../openapi.yaml'));
// Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, {
    customSiteTitle: 'Top Dog Arena API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        displayRequestDuration: true,
        tryItOutEnabled: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true
    }
}));
// Serve raw OpenAPI specification
app.get('/openapi.yaml', (req, res) => {
    res.setHeader('Content-Type', 'application/x-yaml');
    res.sendFile(path_1.default.join(__dirname, '../openapi.yaml'));
});
app.get('/openapi.json', (req, res) => {
    res.json(swaggerDocument);
});
// Redirect root to API documentation
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
// Health endpoints
app.get('/api/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Top Dog Arena API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
app.get('/api/health/detailed', async (req, res) => {
    const walletInfo = xrplService.getWalletInfo();
    const dbHealth = await database_service_1.databaseService.healthCheck();
    return res.status(200).json({
        success: true,
        message: 'Top Dog Arena API health check',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
            api: 'healthy',
            xrpl: walletInfo.connected ? 'connected' : 'disconnected',
            database: dbHealth.connected ? 'connected' : 'disconnected'
        },
        xrpl: {
            connected: walletInfo.connected,
            walletConfigured: !!process.env.XRPL_WALLET_SEED,
            network: process.env.XRPL_NETWORK || 'testnet'
        },
        database: {
            connected: dbHealth.connected,
            responseTime: dbHealth.responseTime
        }
    });
});
app.get('/api/health/xrpl', (req, res) => {
    const walletInfo = xrplService.getWalletInfo();
    return res.status(200).json({
        success: true,
        message: 'XRPL connection status',
        timestamp: new Date().toISOString(),
        xrpl: {
            network: process.env.XRPL_NETWORK || 'testnet',
            serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
            walletAddress: walletInfo.address,
            connected: walletInfo.connected,
            balance: walletInfo.balance,
            configStatus: process.env.XRPL_WALLET_SEED ? 'configured' : 'missing_wallet_seed'
        }
    });
});
// NFT endpoints - Real XRPL Integration
app.post('/api/nft/create', async (req, res) => {
    const { name, description, imageUrl, attributes } = req.body;
    // Basic validation
    if (!name || !description || !imageUrl) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields',
            message: 'name, description, and imageUrl are required',
            timestamp: new Date().toISOString()
        });
    }
    if (!xrplService.isConnected()) {
        return res.status(503).json({
            success: false,
            error: 'XRPL service not connected',
            message: 'Please ensure XRPL wallet is configured and connected',
            timestamp: new Date().toISOString()
        });
    }
    try {
        logger.info(`🎨 Creating NFT: ${name}`);
        const result = await xrplService.createNFT({
            name,
            description,
            imageUrl,
            attributes
        });
        // Save NFT to database
        try {
            const walletInfo = xrplService.getWalletInfo();
            if (result.nftId && walletInfo.address) {
                await database_service_1.databaseService.createNFT({
                    nftTokenID: result.nftId,
                    issuerAddress: walletInfo.address,
                    ownerAddress: walletInfo.address,
                    name,
                    description,
                    imageUrl,
                    attributes: JSON.stringify(attributes || []),
                    txHash: result.txHash,
                    fee: result.fee,
                    category: 'collectible',
                    mintedAt: new Date(),
                });
                // Also save transaction log
                await database_service_1.databaseService.logTransaction({
                    txHash: result.txHash,
                    txType: 'NFTokenMint',
                    account: walletInfo.address,
                    fee: result.fee,
                    nftTokenID: result.nftId,
                    validated: true,
                    successful: true,
                    submittedAt: new Date(),
                    validatedAt: new Date(),
                });
                logger.info(`💾 NFT saved to database: ${result.nftId}`);
            }
        }
        catch (dbError) {
            logger.error('❌ Failed to save NFT to database:', dbError);
            // Continue with response even if database save fails
        }
        return res.status(200).json({
            success: true,
            message: 'NFT created successfully on XRPL testnet',
            data: {
                nftId: result.nftId,
                txHash: result.txHash,
                account: result.account,
                name,
                description,
                imageUrl,
                attributes: attributes || [],
                fee: result.fee,
                network: 'XRPL Testnet'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ NFT creation failed:', error);
        return res.status(500).json({
            success: false,
            error: 'NFT creation failed',
            message: error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/nft/wallet/info', async (req, res) => {
    const walletInfo = xrplService.getWalletInfo();
    // Update balance if connected
    if (walletInfo.connected) {
        try {
            await xrplService.updateBalance();
        }
        catch (error) {
            logger.warn('Could not update balance:', error);
        }
    }
    const updatedWalletInfo = xrplService.getWalletInfo();
    const xrpBalance = updatedWalletInfo.balance && updatedWalletInfo.balance !== 'error'
        ? (parseInt(updatedWalletInfo.balance) / 1000000).toFixed(6)
        : null;
    return res.status(200).json({
        success: true,
        data: {
            network: {
                network: process.env.XRPL_NETWORK || 'testnet',
                serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
                walletAddress: updatedWalletInfo.address
            },
            balance: {
                drops: updatedWalletInfo.balance,
                xrp: xrpBalance
            },
            connected: updatedWalletInfo.connected,
            clientConnected: updatedWalletInfo.client
        },
        message: updatedWalletInfo.connected ? 'Real XRPL wallet connected' : 'Wallet not configured'
    });
});
// Create new XRPL wallet endpoint
app.post('/api/wallet/create', async (req, res) => {
    try {
        logger.info('📝 Creating new XRPL wallet...');
        const newWallet = await xrplService.createWallet();
        // Save the wallet to database
        const account = await database_service_1.databaseService.saveAccount({
            address: newWallet.address,
            network: process.env.XRPL_NETWORK || 'testnet',
            isOwned: true,
            metadata: {
                publicKey: newWallet.publicKey,
                createdAt: new Date().toISOString(),
                source: 'api_generated'
            }
        });
        return res.status(201).json({
            success: true,
            data: {
                address: newWallet.address,
                seed: newWallet.seed,
                publicKey: newWallet.publicKey,
                network: process.env.XRPL_NETWORK || 'testnet',
                databaseId: account.id
            },
            message: 'New XRPL wallet created successfully',
            warning: 'Store the seed securely! It cannot be recovered if lost.',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error creating wallet:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create wallet',
            timestamp: new Date().toISOString()
        });
    }
});
// Validate XRPL address endpoint
app.post('/api/wallet/validate', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required',
                timestamp: new Date().toISOString()
            });
        }
        // XRPL addresses start with 'r' and are 25-34 characters long
        const addressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
        const isValid = addressRegex.test(address);
        return res.status(200).json({
            success: true,
            data: {
                address,
                isValid,
                network: process.env.XRPL_NETWORK || 'testnet'
            },
            message: isValid ? 'Valid XRPL address' : 'Invalid XRPL address format',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error validating address:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to validate address',
            timestamp: new Date().toISOString()
        });
    }
});
// Fund wallet from testnet faucet
app.post('/api/wallet/fund', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required',
                timestamp: new Date().toISOString()
            });
        }
        // Validate address format
        if (!xrplService.isValidXRPLAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid XRPL address format',
                timestamp: new Date().toISOString()
            });
        }
        if (process.env.XRPL_NETWORK !== 'testnet') {
            return res.status(400).json({
                success: false,
                error: 'Wallet funding is only available on testnet',
                timestamp: new Date().toISOString()
            });
        }
        logger.info(`💰 Attempting to fund wallet: ${address}`);
        const fundResult = await xrplService.fundWallet(address);
        if (fundResult.success) {
            const actualAddress = fundResult.fundedAddress || address;
            // Update account in database if it exists
            try {
                await database_service_1.databaseService.updateAccount(actualAddress, {
                    metadata: {
                        funded: true,
                        fundedAt: new Date().toISOString(),
                        initialBalance: fundResult.balance
                    }
                });
            }
            catch (dbError) {
                logger.warn('Could not update account in database:', dbError);
            }
            return res.status(200).json({
                success: true,
                data: {
                    requestedAddress: address,
                    actualAddress: actualAddress,
                    balance: fundResult.balance,
                    network: process.env.XRPL_NETWORK || 'testnet',
                    seed: fundResult.fundedSeed,
                    note: fundResult.fundedAddress ? 'Testnet faucet created a new wallet instead of funding the requested address' : undefined
                },
                message: 'Wallet funded successfully from testnet faucet',
                timestamp: new Date().toISOString()
            });
        }
        else {
            return res.status(400).json({
                success: false,
                error: fundResult.error || 'Failed to fund wallet',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        logger.error('❌ Error funding wallet:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fund wallet',
            timestamp: new Date().toISOString()
        });
    }
});
// Sync wallet balance from XRPL network
app.post('/api/wallet/sync-balance', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required',
                timestamp: new Date().toISOString()
            });
        }
        // Validate address format
        if (!xrplService.isValidXRPLAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid XRPL address format',
                timestamp: new Date().toISOString()
            });
        }
        logger.info(`🔄 Syncing balance for wallet: ${address}`);
        const balanceInfo = await xrplService.getAccountBalance(address);
        if (balanceInfo) {
            // Update balance in database
            try {
                await database_service_1.databaseService.updateAccountBalance(address, balanceInfo.balance, balanceInfo.balanceXRP);
                return res.status(200).json({
                    success: true,
                    data: {
                        address,
                        balance: {
                            drops: balanceInfo.balance,
                            xrp: balanceInfo.balanceXRP
                        },
                        synced: true
                    },
                    message: 'Balance synced successfully',
                    timestamp: new Date().toISOString()
                });
            }
            catch (dbError) {
                logger.error('Failed to update balance in database:', dbError);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save balance to database',
                    timestamp: new Date().toISOString()
                });
            }
        }
        else {
            return res.status(404).json({
                success: false,
                data: {
                    address,
                    balance: null,
                    synced: false
                },
                error: 'Account not found on XRPL network (unfunded)',
                message: 'Account does not exist on XRPL - send XRP to activate it',
                timestamp: new Date().toISOString()
            });
        }
    }
    catch (error) {
        logger.error('❌ Error syncing balance:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to sync balance',
            timestamp: new Date().toISOString()
        });
    }
});
// Batch sync all wallet balances
app.post('/api/wallet/sync-all', async (req, res) => {
    try {
        logger.info('🔄 Syncing all wallet balances...');
        // Get all accounts from database
        const accounts = await database_service_1.databaseService.getAllAccounts();
        const results = [];
        let successCount = 0;
        let errorCount = 0;
        for (const account of accounts) {
            try {
                const balanceInfo = await xrplService.getAccountBalance(account.address);
                if (balanceInfo) {
                    await database_service_1.databaseService.updateAccountBalance(account.address, balanceInfo.balance, balanceInfo.balanceXRP);
                    results.push({
                        address: account.address,
                        success: true,
                        balance: balanceInfo.balanceXRP + ' XRP'
                    });
                    successCount++;
                }
                else {
                    results.push({
                        address: account.address,
                        success: false,
                        error: 'Account not found (unfunded)'
                    });
                    errorCount++;
                }
            }
            catch (error) {
                results.push({
                    address: account.address,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
                errorCount++;
            }
        }
        return res.status(200).json({
            success: true,
            data: {
                totalAccounts: accounts.length,
                successCount,
                errorCount,
                results
            },
            message: `Synced ${successCount}/${accounts.length} wallet balances`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error syncing all balances:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to sync balances',
            timestamp: new Date().toISOString()
        });
    }
});
// Get all wallets/accounts in database
app.get('/api/wallet/list', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const includeSecrets = req.query.includeSecrets === 'true';
        logger.info(`🔍 Retrieving all wallets from database${limit ? ` (limit: ${limit})` : ''}`);
        const accounts = await database_service_1.databaseService.getAllAccounts(limit);
        // Filter out sensitive information unless explicitly requested
        const wallets = accounts.map((account) => {
            const wallet = {
                id: account.id,
                address: account.address,
                network: account.network,
                balance: account.balance,
                balanceXRP: account.balanceXRP,
                isOwned: account.isOwned,
                isActive: account.isActive,
                nickname: account.nickname,
                description: account.description,
                tags: account.tags ? JSON.parse(account.tags) : null,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
                lastSyncAt: account.lastSyncAt,
                nftCount: {
                    owned: account.nftsOwned?.length || 0,
                    issued: account.nftsIssued?.length || 0
                }
            };
            // Only include sensitive data if explicitly requested and wallet is owned by us
            if (includeSecrets && account.isOwned) {
                wallet.publicKey = account.publicKey;
                wallet.hasSeed = !!account.seed;
                wallet.hasPrivateKey = !!account.privateKey;
            }
            return wallet;
        });
        return res.status(200).json({
            success: true,
            data: {
                wallets,
                count: wallets.length,
                total: wallets.length
            },
            message: `Retrieved ${wallets.length} wallets from database`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error retrieving wallets:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to retrieve wallets',
            timestamp: new Date().toISOString()
        });
    }
});
// Get wallet statistics  
app.get('/api/wallet/stats', async (req, res) => {
    try {
        logger.info('📊 Retrieving wallet statistics...');
        const allAccounts = await database_service_1.databaseService.getAllAccounts();
        const stats = {
            totalWallets: allAccounts.length,
            ownedWallets: allAccounts.filter((acc) => acc.isOwned).length,
            externalWallets: allAccounts.filter((acc) => !acc.isOwned).length,
            activeWallets: allAccounts.filter((acc) => acc.isActive).length,
            fundedWallets: allAccounts.filter((acc) => acc.balance && acc.balance !== '0').length,
            unfundedWallets: allAccounts.filter((acc) => !acc.balance || acc.balance === '0').length,
            networkDistribution: {
                testnet: allAccounts.filter((acc) => acc.network === 'testnet').length,
                mainnet: allAccounts.filter((acc) => acc.network === 'mainnet').length,
                devnet: allAccounts.filter((acc) => acc.network === 'devnet').length
            },
            recentlyCreated: allAccounts.filter((acc) => {
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                return acc.createdAt > oneDayAgo;
            }).length,
            recentlySynced: allAccounts.filter((acc) => {
                if (!acc.lastSyncAt)
                    return false;
                const oneHourAgo = new Date();
                oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                return acc.lastSyncAt > oneHourAgo;
            }).length
        };
        return res.status(200).json({
            success: true,
            data: stats,
            message: 'Retrieved wallet statistics',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error retrieving wallet statistics:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to retrieve wallet statistics',
            timestamp: new Date().toISOString()
        });
    }
});
// Get specific wallet by address
app.get('/api/wallet/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const includeSecrets = req.query.includeSecrets === 'true';
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required',
                timestamp: new Date().toISOString()
            });
        }
        logger.info(`🔍 Retrieving wallet information for: ${address}`);
        const account = await database_service_1.databaseService.getAccount(address);
        if (!account) {
            return res.status(404).json({
                success: false,
                error: 'Wallet not found',
                message: `Wallet with address ${address} not found in database`,
                timestamp: new Date().toISOString()
            });
        }
        const wallet = {
            id: account.id,
            address: account.address,
            network: account.network,
            balance: account.balance,
            balanceXRP: account.balanceXRP,
            isOwned: account.isOwned,
            isActive: account.isActive,
            nickname: account.nickname,
            description: account.description,
            tags: account.tags ? JSON.parse(account.tags) : null,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            lastSyncAt: account.lastSyncAt,
            nftCount: {
                owned: account.nftsOwned?.length || 0,
                issued: account.nftsIssued?.length || 0
            }
        };
        // Only include sensitive data if explicitly requested and wallet is owned by us
        if (includeSecrets && account.isOwned) {
            wallet.publicKey = account.publicKey;
            wallet.hasSeed = !!account.seed;
            wallet.hasPrivateKey = !!account.privateKey;
        }
        return res.status(200).json({
            success: true,
            data: wallet,
            message: `Retrieved wallet information for ${address}`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error retrieving wallet:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to retrieve wallet',
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/nft/:nftId', async (req, res) => {
    const { nftId } = req.params;
    if (!nftId || !/^[0-9A-Fa-f]{64}$/.test(nftId)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid NFT ID format',
            message: 'NFT ID must be a 64-character hexadecimal string',
            timestamp: new Date().toISOString()
        });
    }
    try {
        const nft = await database_service_1.databaseService.getNFT(nftId);
        if (!nft) {
            return res.status(404).json({
                success: false,
                error: 'NFT not found',
                message: `NFT with ID ${nftId} not found in database`,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                nftId: nft.nftTokenID,
                name: nft.name,
                description: nft.description,
                imageUrl: nft.imageUrl,
                attributes: nft.attributes ? JSON.parse(nft.attributes) : [],
                owner: {
                    address: nft.ownerAddress,
                    nickname: nft.owner.nickname
                },
                issuer: {
                    address: nft.issuerAddress,
                    nickname: nft.issuer.nickname
                },
                txHash: nft.txHash,
                fee: nft.fee,
                mintedAt: nft.mintedAt,
                category: nft.category,
                rarity: nft.rarity,
                isBurned: nft.isBurned,
                isTransferable: nft.isTransferable
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error(`❌ Failed to get NFT ${nftId}:`, error);
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to retrieve NFT from database',
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/nft/account/:account', async (req, res) => {
    const { account } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    if (!account || !/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(account)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid account address',
            message: 'Account must be a valid XRPL address starting with "r"',
            timestamp: new Date().toISOString()
        });
    }
    try {
        const nfts = await database_service_1.databaseService.getNFTsByOwner(account, limit, offset);
        const formattedNFTs = nfts.map((nft) => ({
            nftId: nft.nftTokenID,
            name: nft.name,
            description: nft.description,
            imageUrl: nft.imageUrl,
            attributes: nft.attributes ? JSON.parse(nft.attributes) : [],
            issuer: {
                address: nft.issuerAddress,
                nickname: nft.issuer.nickname
            },
            txHash: nft.txHash,
            mintedAt: nft.mintedAt,
            category: nft.category,
            rarity: nft.rarity
        }));
        return res.status(200).json({
            success: true,
            data: {
                account,
                nfts: formattedNFTs,
                count: nfts.length,
                limit,
                offset
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error(`❌ Failed to get NFTs for account ${account}:`, error);
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to retrieve NFTs from database',
            timestamp: new Date().toISOString()
        });
    }
});
// Database stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await database_service_1.databaseService.getNFTStats();
        const dbHealth = await database_service_1.databaseService.healthCheck();
        return res.status(200).json({
            success: true,
            data: {
                nfts: {
                    total: stats.totalNFTs,
                    active: stats.activeNFTs,
                    burned: stats.burnedNFTs,
                    recentMints: stats.recentMints
                },
                accounts: {
                    total: stats.totalAccounts
                },
                database: {
                    connected: dbHealth.connected,
                    responseTime: dbHealth.responseTime
                }
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Failed to get stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve statistics',
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});
// Database statistics endpoint
app.get('/api/stats/nft', async (req, res) => {
    try {
        const stats = await database_service_1.databaseService.getNFTStats();
        return res.status(200).json({
            success: true,
            data: {
                totalNFTs: stats.totalNFTs,
                activeNFTs: stats.activeNFTs,
                burnedNFTs: stats.burnedNFTs,
                totalAccounts: stats.totalAccounts,
                recentMints: stats.recentMints
            },
            message: 'NFT statistics retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Failed to get NFT stats:', error);
        return res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to retrieve NFT statistics',
            timestamp: new Date().toISOString()
        });
    }
});
// Auth endpoints (placeholders)
app.post('/api/auth/register', (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'User registration not implemented yet',
        timestamp: new Date().toISOString()
    });
});
app.post('/api/auth/login', (req, res) => {
    return res.status(501).json({
        success: false,
        message: 'User login not implemented yet',
        timestamp: new Date().toISOString()
    });
});
// ======================
// SONGBIRD INTEGRATION ENDPOINTS
// ======================
// Get Songbird connection status
app.get('/api/songbird/status', async (req, res) => {
    try {
        const status = await songbird_service_1.songbirdService.getConnectionStatus();
        return res.status(200).json({
            success: true,
            data: status,
            message: status.connected ? 'Songbird network connected' : 'Songbird network not connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error getting Songbird status:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get Songbird status',
            timestamp: new Date().toISOString()
        });
    }
});
// Wrap XRPL NFT to Songbird
app.post('/api/songbird/wrap', async (req, res) => {
    try {
        const { xrplNftId, songbirdRecipientAddress, xrplOwnerAddress } = req.body;
        if (!xrplNftId || !songbirdRecipientAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: 'xrplNftId and songbirdRecipientAddress are required',
                timestamp: new Date().toISOString()
            });
        }
        logger.info(`🎁 Wrapping XRPL NFT: ${xrplNftId} for ${songbirdRecipientAddress}`);
        // Get NFT metadata from database
        const nft = await database_service_1.databaseService.getNFT(xrplNftId);
        if (!nft) {
            return res.status(404).json({
                success: false,
                error: 'NFT not found',
                message: `NFT with ID ${xrplNftId} not found in database`,
                timestamp: new Date().toISOString()
            });
        }
        // Verify ownership if xrplOwnerAddress provided
        if (xrplOwnerAddress && nft.ownerAddress !== xrplOwnerAddress) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized',
                message: 'You do not own this NFT',
                timestamp: new Date().toISOString()
            });
        }
        // Prepare metadata
        const metadata = {
            name: nft.name || 'XRPL NFT',
            description: nft.description || 'Wrapped XRPL NFT',
            image: nft.imageUrl || '',
            attributes: nft.attributes ? JSON.parse(nft.attributes) : []
        };
        // Wrap the NFT
        const result = await songbird_service_1.songbirdService.wrapXRPLNFT({
            xrplNftId,
            xrplOwnerAddress: nft.ownerAddress,
            songbirdRecipientAddress,
            metadata
        });
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                message: 'Failed to wrap NFT on Songbird',
                timestamp: new Date().toISOString()
            });
        }
        // Update database with wrapped status
        try {
            await database_service_1.databaseService.updateNFTStatus(xrplNftId, {
                isWrapped: true,
                songbirdTokenId: result.songbirdTokenId,
                wrapTransactionHash: result.transactionHash,
                wrappedAt: new Date()
            });
        }
        catch (dbError) {
            logger.warn('⚠️ Failed to update database with wrap status:', dbError);
        }
        return res.status(200).json({
            success: true,
            data: {
                xrplNftId,
                songbirdTokenId: result.songbirdTokenId,
                transactionHash: result.transactionHash,
                gasUsed: result.gasUsed,
                songbirdRecipientAddress,
                metadata
            },
            message: 'NFT successfully wrapped on Songbird',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error wrapping NFT:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to wrap NFT',
            timestamp: new Date().toISOString()
        });
    }
});
// Unwrap Songbird NFT back to XRPL
app.post('/api/songbird/unwrap', async (req, res) => {
    try {
        const { songbirdTokenId } = req.body;
        if (!songbirdTokenId) {
            return res.status(400).json({
                success: false,
                error: 'Missing songbirdTokenId',
                timestamp: new Date().toISOString()
            });
        }
        logger.info(`📤 Unwrapping Songbird NFT: ${songbirdTokenId}`);
        // Get wrapped NFT info first
        const nftInfo = await songbird_service_1.songbirdService.getWrappedNFTInfo(songbirdTokenId);
        if (!nftInfo.success || !nftInfo.info) {
            return res.status(404).json({
                success: false,
                error: 'Wrapped NFT not found',
                timestamp: new Date().toISOString()
            });
        }
        // Unwrap the NFT
        const result = await songbird_service_1.songbirdService.unwrapNFT(songbirdTokenId);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                message: 'Failed to unwrap NFT from Songbird',
                timestamp: new Date().toISOString()
            });
        }
        // Update database with unwrapped status
        try {
            await database_service_1.databaseService.updateNFTStatus(result.xrplNftId, {
                isWrapped: false,
                unwrapTransactionHash: result.transactionHash,
                unwrappedAt: new Date()
            });
        }
        catch (dbError) {
            logger.warn('⚠️ Failed to update database with unwrap status:', dbError);
        }
        return res.status(200).json({
            success: true,
            data: {
                songbirdTokenId,
                xrplNftId: result.xrplNftId,
                transactionHash: result.transactionHash,
                gasUsed: result.gasUsed,
                owner: nftInfo.info.owner
            },
            message: 'NFT successfully unwrapped from Songbird',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error unwrapping NFT:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unwrap NFT',
            timestamp: new Date().toISOString()
        });
    }
});
// Get wrapped NFT info
app.get('/api/songbird/nft/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        logger.info(`🔍 Getting wrapped NFT info: ${tokenId}`);
        const result = await songbird_service_1.songbirdService.getWrappedNFTInfo(tokenId);
        if (!result.success) {
            return res.status(404).json({
                success: false,
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({
            success: true,
            data: result.info,
            message: 'Wrapped NFT info retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error getting wrapped NFT info:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get wrapped NFT info',
            timestamp: new Date().toISOString()
        });
    }
});
// Get gas estimates for operations
app.get('/api/songbird/gas/:operation', async (req, res) => {
    try {
        const { operation } = req.params;
        if (!['wrap', 'unwrap'].includes(operation)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid operation',
                message: 'Operation must be "wrap" or "unwrap"',
                timestamp: new Date().toISOString()
            });
        }
        const gasEstimate = await songbird_service_1.songbirdService.getGasEstimate(operation);
        return res.status(200).json({
            success: true,
            data: {
                operation,
                ...gasEstimate
            },
            message: `Gas estimate for ${operation} operation`,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error getting gas estimate:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get gas estimate',
            timestamp: new Date().toISOString()
        });
    }
});
// Get wallet NFTs on Songbird
app.get('/api/songbird/wallet/:address/nfts', async (req, res) => {
    try {
        const { address } = req.params;
        logger.info(`🔍 Getting Songbird NFTs for wallet: ${address}`);
        const result = await songbird_service_1.songbirdService.getWalletNFTs(address);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                timestamp: new Date().toISOString()
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                wallet: address,
                nfts: result.nfts,
                count: result.nfts?.length || 0
            },
            message: 'Songbird NFTs retrieved successfully',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        logger.error('❌ Error getting wallet NFTs:', error);
        return res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get wallet NFTs',
            timestamp: new Date().toISOString()
        });
    }
});
// 404 handler
app.use('*', (req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});
// Error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    return res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});
// Start server with XRPL and Database initialization
async function startServer() {
    try {
        // Initialize database connection
        await database_service_1.databaseService.connect();
        // Initialize XRPL service
        await xrplService.initialize();
        app.listen(PORT, () => {
            logger.info(`🚀 Top Dog Arena Backend Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 XRPL Network: ${process.env.XRPL_NETWORK || 'testnet'}`);
            logger.info(`⚡ Health check: http://localhost:${PORT}/api/health`);
            logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
            if (!process.env.XRPL_WALLET_SEED) {
                logger.warn(`🔧 Configure XRPL_WALLET_SEED to enable NFT functionality`);
            }
            else {
                logger.info(`✅ XRPL wallet configured and connected`);
            }
        });
    }
    catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('🔌 Shutting down gracefully...');
    await Promise.all([
        xrplService.disconnect(),
        database_service_1.databaseService.disconnect()
    ]);
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger.info('🔌 Shutting down gracefully...');
    await Promise.all([
        xrplService.disconnect(),
        database_service_1.databaseService.disconnect()
    ]);
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=fixed-server.js.map