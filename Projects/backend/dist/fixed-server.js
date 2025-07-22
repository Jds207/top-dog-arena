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
    res.status(200).json({
        success: true,
        message: 'Top Dog Arena API is running',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
app.get('/api/health/detailed', async (req, res) => {
    const walletInfo = xrplService.getWalletInfo();
    const dbHealth = await database_service_1.databaseService.healthCheck();
    res.status(200).json({
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
    res.status(200).json({
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
    res.status(200).json({
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
    res.status(501).json({
        success: false,
        message: 'User registration not implemented yet',
        timestamp: new Date().toISOString()
    });
});
app.post('/api/auth/login', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'User login not implemented yet',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
});
// Error handler
app.use((error, req, res, next) => {
    logger.error('Unhandled error:', error);
    res.status(500).json({
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