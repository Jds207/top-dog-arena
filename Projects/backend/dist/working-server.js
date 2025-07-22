"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
// Load envi// Start server
async function startServer() {
    try {
        // Initialize XRPL service
        await xrplService.initialize();
        // Start Express server
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
                logger.info(`✅ XRPL wallet configured`);
            }
        });
    }
    catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
// Create simple logger
const logger = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args)
};
// XRPL Service
class SimpleXRPLService {
    connected = false;
    walletAddress = null;
    balance = null;
    async initialize() {
        try {
            // Simulate XRPL connection attempt
            const serverUrl = process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233';
            logger.info(`🔗 Attempting to connect to XRPL: ${serverUrl}`);
            // For now, just check if we have a wallet seed
            if (process.env.XRPL_WALLET_SEED) {
                this.connected = true;
                this.walletAddress = 'rTest...wallet'; // Would be actual address
                this.balance = '1000000'; // Would be actual balance
                logger.info('✅ XRPL service connected (simulated)');
            }
            else {
                logger.warn('⚠️ XRPL_WALLET_SEED not configured');
            }
        }
        catch (error) {
            logger.error('❌ XRPL connection failed:', error);
        }
    }
    isConnected() {
        return this.connected;
    }
    getWalletInfo() {
        return {
            address: this.walletAddress,
            balance: this.balance,
            connected: this.connected
        };
    }
}
const xrplService = new SimpleXRPLService();
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
app.get('/api/health/detailed', (req, res) => {
    const walletInfo = xrplService.getWalletInfo();
    res.status(200).json({
        success: true,
        message: 'Top Dog Arena API health check',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        services: {
            api: 'healthy',
            xrpl: walletInfo.connected ? 'connected' : 'disconnected',
            database: 'not_configured'
        },
        xrpl: {
            connected: walletInfo.connected,
            walletConfigured: !!process.env.XRPL_WALLET_SEED,
            network: process.env.XRPL_NETWORK || 'testnet'
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
// NFT endpoints (placeholder responses for now)
app.post('/api/nft/create', (req, res) => {
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
    res.status(200).json({
        success: true,
        message: 'NFT metadata received',
        data: {
            nftId: 'demo-nft-' + Math.random().toString(36).substr(2, 9),
            name,
            description,
            imageUrl,
            attributes: attributes || []
        },
        timestamp: new Date().toISOString()
    });
});
app.get('/api/nft/wallet/info', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            network: {
                network: process.env.XRPL_NETWORK || 'testnet',
                serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
                walletAddress: null
            },
            balance: null
        },
        message: 'Wallet info retrieved (not configured)'
    });
});
app.get('/api/nft/:nftId', (req, res) => {
    res.status(503).json({
        success: false,
        error: 'XRPL service not configured',
        message: 'Please configure XRPL wallet to query NFTs',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/nft/account/:account', (req, res) => {
    res.status(503).json({
        success: false,
        error: 'XRPL service not configured',
        message: 'Please configure XRPL wallet to query account NFTs',
        timestamp: new Date().toISOString()
    });
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
// Start server
app.listen(PORT, () => {
    logger.info(`🚀 Top Dog Arena Backend Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🌐 XRPL Network: ${process.env.XRPL_NETWORK || 'testnet'}`);
    logger.info(`⚡ Health check: http://localhost:${PORT}/api/health`);
    logger.info(`� API Documentation: http://localhost:${PORT}/api-docs`);
    logger.info(`�🔧 Configure XRPL_WALLET_SEED to enable NFT functionality`);
});
exports.default = app;
//# sourceMappingURL=working-server.js.map