import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
// Force reload for enhanced XRPL logging - v2
import YAML from 'yamljs';
import path from 'path';
import { Client, Wallet, NFTokenMint, xrpToDrops } from 'xrpl';
import multer from 'multer';
import fs from 'fs';
import { databaseService } from './services/database.service';
import { songbirdService } from './services/songbird.service';
import { logger as winstonLogger } from './utils/logger';

// Load environment variables
dotenv.config();

// Enhanced logger with file persistence and detailed analysis capabilities
const logger = {
  info: (msg: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[INFO] ${timestamp} - ${msg}`;
    console.log(formattedMsg, ...args);
    winstonLogger.info(formattedMsg, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[WARN] ${timestamp} - ${msg}`;
    console.warn(formattedMsg, ...args);
    winstonLogger.warn(formattedMsg, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[ERROR] ${timestamp} - ${msg}`;
    console.error(formattedMsg, ...args);
    winstonLogger.error(formattedMsg, ...args);
  },
  debug: (msg: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (process.env.LOG_LEVEL === 'debug') {
      const formattedMsg = `[DEBUG] ${timestamp} - ${msg}`;
      if (data) {
        console.log(formattedMsg, JSON.stringify(data, null, 2));
        winstonLogger.debug(formattedMsg, data);
      } else {
        console.log(formattedMsg);
        winstonLogger.debug(formattedMsg);
      }
    }
  },
  apiCall: (method: string, path: string, ip: string, body?: any) => {
    const timestamp = new Date().toISOString();
    const logData: any = { method, path, ip, timestamp };
    if (body) logData.body = body;
    const formattedMsg = `[API] ${timestamp} - ${method} ${path} from ${ip}`;
    console.log(formattedMsg, process.env.LOG_LEVEL === 'debug' ? logData : '');
    winstonLogger.info(formattedMsg, logData);
  },
  fundingFlow: (step: string, data: any) => {
    const timestamp = new Date().toISOString();
    const formattedMsg = `[FUNDING] ${timestamp} - ${step}:`;
    console.log(formattedMsg, JSON.stringify(data, null, 2));
    winstonLogger.info(formattedMsg, data);
  }
};

// Real XRPL Service
class RealXRPLService {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private connected = false;
  private balance: string | null = null;

  async initialize(): Promise<void> {
    try {
      const serverUrl = process.env.XRPL_SERVER_URL || 'wss://s.altnet.rippletest.net:51233';
      logger.info(`🔗 Connecting to XRPL: ${serverUrl}`);
      
      // Create and connect XRPL client
      this.client = new Client(serverUrl);
      await this.client.connect();
      logger.info(`✅ Connected to XRPL ${process.env.XRPL_NETWORK || 'testnet'}`);

      // Initialize wallet if seed is provided
      if (process.env.XRPL_WALLET_SEED) {
        this.wallet = Wallet.fromSeed(process.env.XRPL_WALLET_SEED);
        logger.info(`✅ XRPL wallet initialized: ${this.wallet.address}`);
        
        // Check wallet balance
        await this.updateBalance();
        this.connected = true;
      } else {
        logger.warn('⚠️ XRPL_WALLET_SEED not configured');
      }
    } catch (error) {
      logger.error('❌ XRPL connection failed:', error);
      this.connected = false;
    }
  }

  async updateBalance(): Promise<void> {
    if (!this.client || !this.wallet) return;
    
    try {
      const response = await this.client.request({
        command: 'account_info',
        account: this.wallet.address,
        ledger_index: 'validated'
      });
      
      this.balance = response.result.account_data.Balance;
      const xrpBalance = (parseInt(this.balance) / 1000000).toFixed(6);
      logger.info(`💰 Wallet balance: ${xrpBalance} XRP (${this.balance} drops)`);
    } catch (error) {
      logger.error('❌ Failed to get wallet balance:', error);
      this.balance = 'error';
    }
  }

  async createNFT(metadata: {name: string, description: string, imageUrl: string, attributes?: any[]}): Promise<any> {
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
      const nftMintTx: NFTokenMint = {
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
          const meta = response.result.meta as any;
          
          let nftokenId = null;
          
          // First, check if there's a direct nftoken_id in metadata
          if (meta.nftoken_id) {
            nftokenId = meta.nftoken_id;
            logger.info('🎯 Found NFTokenID in metadata:', nftokenId);
          } else {
            // Look for NFToken in modified NFTokenPage nodes
            const modifiedNodes = meta.AffectedNodes?.filter((node: any) => 
              node.ModifiedNode?.LedgerEntryType === 'NFTokenPage'
            );
            
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
              const createdNodes = meta.AffectedNodes?.filter((node: any) => 
                node.CreatedNode?.LedgerEntryType === 'NFTokenPage'
              );
              
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
        } else {
          throw new Error(`Transaction failed: ${response.result.meta.TransactionResult}`);
        }
      } else {
        throw new Error('Invalid transaction response');
      }
    } catch (error) {
      logger.error('❌ NFT minting failed:', error);
      throw error;
    }
  }

  isConnected(): boolean {
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

  async fundWallet(address: string): Promise<{
    success: boolean;
    balance?: string;
    error?: string;
    fundedAddress?: string;
    fundedSeed?: string;
  }> {
    try {
      if (!this.client) {
        throw new Error('XRPL client not connected');
      }

      // Fund the wallet using XRPL library's fundWallet method
      const fundResult = await this.client.fundWallet();
      
      if (fundResult?.wallet?.address) {
        // Convert balance properly - XRPL faucet returns balance as XRP amount, not drops
        const balanceXRP = fundResult.balance?.toString() || '0';
        const balanceDrops = (parseFloat(balanceXRP) * 1000000).toString();
        
        logger.info(`💰 Funded wallet ${fundResult.wallet.address} with ${balanceXRP} XRP (${balanceDrops} drops)`);
        
        return {
          success: true,
          balance: balanceDrops, // Return drops for consistency
          fundedAddress: fundResult.wallet.address,
          fundedSeed: fundResult.wallet.seed
        };
      } else {
        return {
          success: false,
          error: 'Failed to fund wallet from faucet'
        };
      }
    } catch (error) {
      logger.error('❌ Error funding wallet:', error);
      return {
        success: false,
        error: `Failed to fund wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getAccountBalance(address: string): Promise<{
    balance: string;
    balanceXRP: string;
  } | null> {
    if (!this.client) return null;
    
    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      
      const balance = response.result.account_data.Balance;
      const balanceXRP = (parseInt(balance) / 1000000).toFixed(6);
      
      return { balance, balanceXRP };
    } catch (error) {
      logger.info(`Account ${address} not found or unfunded:`, error);
      return null;
    }
  }

  isValidXRPLAddress(address: string): boolean {
    try {
      // XRPL addresses start with 'r' and are 25-34 characters long
      const addressRegex = /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/;
      return addressRegex.test(address);
    } catch (error) {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      logger.info('🔌 Disconnected from XRPL');
    }
  }
}

const xrplService = new RealXRPLService();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

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

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Log incoming request
  if (req.path !== '/api/health') { // Skip health check logs to reduce noise
    logger.apiCall(req.method, req.path, clientIP);
  }
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : res.statusCode >= 500 ? 'error' : 'debug';
    
    if (req.path !== '/api/health' && logLevel !== 'debug') {
      logger[logLevel](`${req.method} ${req.path} - ${res.statusCode} (${duration}ms) from ${clientIP}`);
    }
    
    // Log slow requests
    if (duration > 1000) {
      logger.warn(`SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

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
  return res.status(200).json({
    success: true,
    message: 'Top Dog Arena API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

app.get('/api/health/detailed', async (req, res) => {
  const walletInfo = xrplService.getWalletInfo();
  const dbHealth = await databaseService.healthCheck();
  
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
        await databaseService.createNFT({
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
        await databaseService.logTransaction({
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
    } catch (dbError) {
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
  } catch (error) {
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
    } catch (error) {
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
    
    // Save the wallet to database INCLUDING private key and seed
    const account = await databaseService.saveAccount({
      address: newWallet.address,
      network: process.env.XRPL_NETWORK || 'testnet',
      publicKey: newWallet.publicKey,
      privateKey: newWallet.privateKey,
      seed: newWallet.seed,
      isOwned: true,
      metadata: {
        createdAt: new Date().toISOString(),
        source: 'api_generated'
      }
    });

    logger.info(`🔑 Saved wallet with private credentials to database: ${newWallet.address}`);

    return res.status(201).json({
      success: true,
      data: {
        address: newWallet.address,
        seed: newWallet.seed,
        publicKey: newWallet.publicKey,
        network: process.env.XRPL_NETWORK || 'testnet',
        databaseId: account.id
      },
      message: 'New XRPL wallet created and saved to database',
      info: 'Private key and seed are stored in the database for this wallet.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
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

  } catch (error) {
    logger.error('❌ Error validating address:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate address',
      timestamp: new Date().toISOString()
    });
  }
});

// Get wallet credentials (for owned wallets only)
app.get('/api/wallet/:address/credentials', async (req, res) => {
  try {
    const { address } = req.params;
    
    logger.info(`🔑 Retrieving credentials for wallet: ${address}`);

    const account = await databaseService.getAccount(address);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        message: `Wallet with address ${address} not found in database`,
        timestamp: new Date().toISOString()
      });
    }

    if (!account.isOwned) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'Credentials are only available for owned wallets',
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        address: account.address,
        publicKey: account.publicKey,
        privateKey: account.privateKey,
        seed: account.seed,
        network: account.network,
        createdAt: account.createdAt
      },
      message: `Retrieved credentials for wallet ${address}`,
      warning: 'Keep these credentials secure and never share them!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Error retrieving wallet credentials:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve credentials',
      timestamp: new Date().toISOString()
    });
  }
});

// Fund wallet from testnet faucet
app.post('/api/wallet/fund', async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    const { address } = req.body;
    
    // Log API call
    logger.apiCall('POST', '/api/wallet/fund', clientIP, { address });
    logger.fundingFlow('FUNDING_REQUEST_RECEIVED', {
      requestedAddress: address,
      clientIP,
      timestamp: new Date().toISOString()
    });

    if (!address) {
      logger.warn('Funding request missing address parameter');
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate address format
    if (!xrplService.isValidXRPLAddress(address)) {
      logger.warn(`Invalid XRPL address format provided: ${address}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid XRPL address format',
        timestamp: new Date().toISOString()
      });
    }

    if (process.env.XRPL_NETWORK !== 'testnet') {
      logger.error('Funding attempted on non-testnet environment');
      return res.status(400).json({
        success: false,
        error: 'Wallet funding is only available on testnet',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`💰 Attempting to fund wallet: ${address}`);
    logger.fundingFlow('CALLING_FAUCET', {
      requestedAddress: address,
      network: process.env.XRPL_NETWORK
    });
    
    const fundResult = await xrplService.fundWallet(address);
    
    logger.fundingFlow('FAUCET_RESPONSE', {
      success: fundResult.success,
      requestedAddress: address,
      actualAddress: fundResult.fundedAddress,
      balance: fundResult.balance,
      error: fundResult.error
    });
    
    if (fundResult.success) {
      // The fundedAddress is the actual wallet that was funded by the faucet
      const actualAddress = fundResult.fundedAddress!; // This should always exist for testnet faucet
      
      logger.fundingFlow('UPDATING_DATABASE_WITH_FUNDED_ADDRESS', {
        requestedAddress: address,
        actualAddress,
        balance: fundResult.balance,
        operation: 'replaceOrCreate'
      });
      
      // Check if the requested address already exists in the database
      try {
        const existingAccount = await databaseService.getAccount(address);
        
        if (existingAccount) {
          // Update the existing record with the new funded address
          logger.fundingFlow('REPLACING_EXISTING_RECORD', {
            originalAddress: address,
            newAddress: actualAddress,
            existingId: existingAccount.id
          });
          
          await databaseService.updateAccount(address, {
            address: actualAddress,
            balance: fundResult.balance, // Save drops
            balanceXRP: (parseInt(fundResult.balance || '0') / 1000000).toFixed(6), // Save XRP
            seed: fundResult.fundedSeed, // Save the seed from faucet
            description: `Funded wallet (originally requested: ${address})`,
            metadata: {
              funded: true,
              fundedAt: new Date().toISOString(),
              requestedAddress: address,
              actualAddress: actualAddress,
              balanceDrops: fundResult.balance,
              balanceXRP: (parseInt(fundResult.balance || '0') / 1000000).toFixed(6),
              network: process.env.XRPL_NETWORK || 'testnet',
              seed: fundResult.fundedSeed,
              note: 'Testnet faucet created a new wallet instead of funding the requested address',
              originalAddress: address,
              replacedAddress: true,
              createdViaFaucet: true
            }
          });
          
          logger.fundingFlow('EXISTING_RECORD_UPDATED', {
            originalAddress: address,
            newAddress: actualAddress,
            success: true
          });
          
        } else {
          // Create a new record for the funded wallet with all response data
          logger.fundingFlow('CREATING_NEW_RECORD', {
            actualAddress,
            requestedAddress: address
          });
          
          await databaseService.createAccount({
            address: actualAddress,
            network: 'testnet',
            balance: fundResult.balance, // Save drops
            balanceXRP: (parseInt(fundResult.balance || '0') / 1000000).toFixed(6), // Save XRP
            seed: fundResult.fundedSeed, // Save the seed from faucet
            isOwned: false,
            description: `Auto-funded wallet created from testnet faucet (originally requested: ${address})`
          });
          
          // Then update with complete funding metadata matching response object
          await databaseService.updateAccount(actualAddress, {
            metadata: {
              funded: true,
              fundedAt: new Date().toISOString(),
              requestedAddress: address,
              actualAddress: actualAddress,
              balanceDrops: fundResult.balance,
              balanceXRP: (parseInt(fundResult.balance || '0') / 1000000).toFixed(6),
              network: process.env.XRPL_NETWORK || 'testnet',
              seed: fundResult.fundedSeed,
              note: 'Testnet faucet created a new wallet instead of funding the requested address',
              originalRequest: address,
              createdViaFaucet: true
            }
          });
          
          logger.fundingFlow('NEW_RECORD_CREATED', {
            actualAddress,
            originalRequest: address,
            success: true
          });
        }
        
      } catch (dbError) {
        logger.error('Failed to create/update account in database:', dbError);
        logger.fundingFlow('DATABASE_OPERATION_FAILED', {
          actualAddress,
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        });
      }

      const responseData = {
        requestedAddress: address,
        actualAddress: actualAddress,
        balanceDrops: fundResult.balance,
        balanceXRP: (parseInt(fundResult.balance || '0') / 1000000).toFixed(6),
        network: process.env.XRPL_NETWORK || 'testnet',
        seed: fundResult.fundedSeed,
        note: 'Testnet faucet created a new wallet instead of funding the requested address'
      };

      const duration = Date.now() - startTime;
      
      logger.fundingFlow('FUNDING_SUCCESS', {
        ...responseData,
        processingTimeMs: duration,
        clientIP
      });

      return res.status(200).json({
        success: true,
        data: responseData,
        message: 'Wallet funded successfully from testnet faucet',
        timestamp: new Date().toISOString()
      });
    } else {
      logger.fundingFlow('FUNDING_FAILED', {
        requestedAddress: address,
        error: fundResult.error,
        processingTimeMs: Date.now() - startTime
      });
      
      return res.status(400).json({
        success: false,
        error: fundResult.error || 'Failed to fund wallet',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ Error funding wallet:', error);
    logger.fundingFlow('FUNDING_ERROR', {
      requestedAddress: req.body.address,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: duration,
      clientIP
    });
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fund wallet',
      timestamp: new Date().toISOString()
    });
  }
});

// Sync wallet balance from XRPL network
app.post('/api/wallet/sync-balance', async (req, res) => {
  const startTime = Date.now();
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    const { address } = req.body;

    // Log API call
    logger.apiCall('POST', '/api/wallet/sync-balance', clientIP, { address });
    logger.debug('Balance sync request', { address, clientIP });

    if (!address) {
      logger.warn('Balance sync request missing address parameter');
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required',
        timestamp: new Date().toISOString()
      });
    }

    // Validate address format
    if (!xrplService.isValidXRPLAddress(address)) {
      logger.warn(`Invalid XRPL address format for sync: ${address}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid XRPL address format',
        timestamp: new Date().toISOString()
      });
    }

    logger.info(`🔄 Syncing balance for wallet: ${address}`);
    
    const balanceInfo = await xrplService.getAccountBalance(address);
    
    logger.debug('XRPL balance query result', {
      address,
      found: !!balanceInfo,
      balance: balanceInfo?.balance,
      balanceXRP: balanceInfo?.balanceXRP
    });
    
    if (balanceInfo) {
      // Update balance in database
      try {
        await databaseService.updateAccountBalance(address, balanceInfo.balance, balanceInfo.balanceXRP);
        
        const duration = Date.now() - startTime;
        logger.info(`✅ Balance synced for ${address}: ${balanceInfo.balanceXRP} XRP (${duration}ms)`);
        
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
      } catch (dbError) {
        logger.error('Failed to update balance in database:', dbError);
        return res.status(500).json({
          success: false,
          error: 'Failed to save balance to database',
          timestamp: new Date().toISOString()
        });
      }
    } else {
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

  } catch (error) {
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
    const accounts = await databaseService.getAllAccounts();
    
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const account of accounts) {
      try {
        const balanceInfo = await xrplService.getAccountBalance(account.address);
        
        if (balanceInfo) {
          await databaseService.updateAccountBalance(
            account.address, 
            balanceInfo.balance, 
            balanceInfo.balanceXRP
          );
          
          results.push({
            address: account.address,
            success: true,
            balance: balanceInfo.balanceXRP + ' XRP'
          });
          successCount++;
        } else {
          results.push({
            address: account.address,
            success: false,
            error: 'Account not found (unfunded)'
          });
          errorCount++;
        }
      } catch (error) {
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

  } catch (error) {
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
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const includeSecrets = req.query.includeSecrets === 'true';
    
    logger.info(`🔍 Retrieving all wallets from database${limit ? ` (limit: ${limit})` : ''}`);

    const accounts = await databaseService.getAllAccounts(limit);
    
    // Filter out sensitive information unless explicitly requested
    const wallets = accounts.map((account: any) => {
      const wallet: any = {
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

  } catch (error) {
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

    const allAccounts = await databaseService.getAllAccounts();
    
    const stats = {
      totalWallets: allAccounts.length,
      ownedWallets: allAccounts.filter((acc: any) => acc.isOwned).length,
      externalWallets: allAccounts.filter((acc: any) => !acc.isOwned).length,
      activeWallets: allAccounts.filter((acc: any) => acc.isActive).length,
      fundedWallets: allAccounts.filter((acc: any) => acc.balance && acc.balance !== '0').length,
      unfundedWallets: allAccounts.filter((acc: any) => !acc.balance || acc.balance === '0').length,
      networkDistribution: {
        testnet: allAccounts.filter((acc: any) => acc.network === 'testnet').length,
        mainnet: allAccounts.filter((acc: any) => acc.network === 'mainnet').length,
        devnet: allAccounts.filter((acc: any) => acc.network === 'devnet').length
      },
      recentlyCreated: allAccounts.filter((acc: any) => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        return acc.createdAt > oneDayAgo;
      }).length,
      recentlySynced: allAccounts.filter((acc: any) => {
        if (!acc.lastSyncAt) return false;
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

  } catch (error) {
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

    const account = await databaseService.getAccount(address);
    
    if (!account) {
      return res.status(404).json({
        success: false,
        error: 'Wallet not found',
        message: `Wallet with address ${address} not found in database`,
        timestamp: new Date().toISOString()
      });
    }

    const wallet: any = {
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

  } catch (error) {
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
    const nft = await databaseService.getNFT(nftId);
    
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
  } catch (error) {
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
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  
  if (!account || !/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(account)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid account address',
      message: 'Account must be a valid XRPL address starting with "r"',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const nfts = await databaseService.getNFTsByOwner(account, limit, offset);
    
    const formattedNFTs = nfts.map((nft: any) => ({
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
  } catch (error) {
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
    const stats = await databaseService.getNFTStats();
    const dbHealth = await databaseService.healthCheck();
    
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
  } catch (error) {
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
    const stats = await databaseService.getNFTStats();
    
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
  } catch (error) {
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
    const status = await songbirdService.getConnectionStatus();
    
    return res.status(200).json({
      success: true,
      data: status,
      message: status.connected ? 'Songbird network connected' : 'Songbird network not connected',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
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
    const nft = await databaseService.getNFT(xrplNftId);
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
    const result = await songbirdService.wrapXRPLNFT({
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
      await databaseService.updateNFTStatus(xrplNftId, {
        isWrapped: true,
        songbirdTokenId: result.songbirdTokenId,
        wrapTransactionHash: result.transactionHash,
        wrappedAt: new Date()
      });
    } catch (dbError) {
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

  } catch (error) {
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
    const nftInfo = await songbirdService.getWrappedNFTInfo(songbirdTokenId);
    if (!nftInfo.success || !nftInfo.info) {
      return res.status(404).json({
        success: false,
        error: 'Wrapped NFT not found',
        timestamp: new Date().toISOString()
      });
    }

    // Unwrap the NFT
    const result = await songbirdService.unwrapNFT(songbirdTokenId);
    
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
      await databaseService.updateNFTStatus(result.xrplNftId!, {
        isWrapped: false,
        unwrapTransactionHash: result.transactionHash,
        unwrappedAt: new Date()
      });
    } catch (dbError) {
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

  } catch (error) {
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

    const result = await songbirdService.getWrappedNFTInfo(tokenId);
    
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

  } catch (error) {
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

    const gasEstimate = await songbirdService.getGasEstimate(operation as 'wrap' | 'unwrap');
    
    return res.status(200).json({
      success: true,
      data: {
        operation,
        ...gasEstimate
      },
      message: `Gas estimate for ${operation} operation`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
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

    const result = await songbirdService.getWalletNFTs(address);
    
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

  } catch (error) {
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
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
    await databaseService.connect();
    
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
      } else {
        logger.info(`✅ XRPL wallet configured and connected`);
      }
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔌 Shutting down gracefully...');
  await Promise.all([
    xrplService.disconnect(),
    databaseService.disconnect()
  ]);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🔌 Shutting down gracefully...');
  await Promise.all([
    xrplService.disconnect(),
    databaseService.disconnect()
  ]);
  process.exit(0);
});

startServer();

export default app;
