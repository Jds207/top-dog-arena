import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load environment variables
dotenv.config();

// Create simple logger
const logger = {
  info: (msg: string, ...args: any[]) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg: string, ...args: any[]) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg: string, ...args: any[]) => console.error(`[ERROR] ${msg}`, ...args)
};

// XRPL Service
class SimpleXRPLService {
  private connected = false;
  private walletAddress: string | null = null;
  private balance: string | null = null;

  async initialize(): Promise<void> {
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
      } else {
        logger.warn('⚠️ XRPL_WALLET_SEED not configured');
      }
    } catch (error) {
      logger.error('❌ XRPL connection failed:', error);
    }
  }

  isConnected(): boolean {
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

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Load OpenAPI specification
const swaggerDocument = YAML.load(path.join(__dirname, '../openapi.yaml'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
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
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
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
  if (!xrplService.isConnected()) {
    res.status(503).json({
      success: false,
      error: 'XRPL service not configured',
      message: 'Please configure XRPL_WALLET_SEED environment variable to enable NFT creation',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'NFT creation would work here (demo mode)',
    data: {
      nftId: 'demo-nft-' + Math.random().toString(36).substr(2, 9),
      status: 'simulated'
    },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/nft/batch-create', (req, res) => {
  if (!xrplService.isConnected()) {
    res.status(503).json({
      success: false,
      error: 'XRPL service not configured',
      message: 'Please configure XRPL_WALLET_SEED environment variable to enable batch NFT creation',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Batch NFT creation would work here (demo mode)',
    data: {
      batchId: 'demo-batch-' + Math.random().toString(36).substr(2, 9),
      status: 'simulated'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/nft/wallet/info', (req, res) => {
  const walletInfo = xrplService.getWalletInfo();
  res.status(200).json({
    success: true,
    data: {
      network: {
        network: process.env.XRPL_NETWORK || 'testnet',
        serverUrl: process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233',
        walletAddress: walletInfo.address
      },
      balance: walletInfo.balance,
      connected: walletInfo.connected
    },
    message: walletInfo.connected ? 'Wallet info retrieved' : 'Wallet not configured'
  });
});

app.get('/api/nft/:nftId', (req, res) => {
  if (!xrplService.isConnected()) {
    res.status(503).json({
      success: false,
      error: 'XRPL service not configured',
      message: 'Please configure XRPL wallet to query NFTs',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'NFT query would work here (demo mode)',
    data: {
      nftId: req.params.nftId,
      status: 'simulated'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/nft/account/:account', (req, res) => {
  if (!xrplService.isConnected()) {
    res.status(503).json({
      success: false,
      error: 'XRPL service not configured',
      message: 'Please configure XRPL wallet to query account NFTs',
      timestamp: new Date().toISOString()
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Account NFT query would work here (demo mode)',
    data: {
      account: req.params.account,
      nfts: [],
      status: 'simulated'
    },
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
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// Start server
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
      } else {
        logger.info(`✅ XRPL wallet configured and connected`);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
