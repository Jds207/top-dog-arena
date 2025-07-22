import { Router, Request, Response } from 'express';
import { xrplService } from '../services/xrpl.service';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Top Dog Arena API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Detailed health check including XRPL connection
 * @access  Public
 */
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const healthData = {
    success: true,
    message: 'Top Dog Arena API health check',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'healthy',
      xrpl: 'unknown',
      database: 'unknown'
    }
  };

  try {
    // Check XRPL connection
    const networkInfo = xrplService.getNetworkInfo();
    if (networkInfo.walletAddress) {
      healthData.services.xrpl = 'connected';
      
      // Optionally check balance (but don't fail if it errors)
      try {
        await xrplService.checkWalletBalance();
      } catch (error) {
        logger.warn('Could not fetch balance during health check:', error);
      }
    } else {
      healthData.services.xrpl = 'disconnected';
    }

    res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check error:', error);
    
    healthData.success = false;
    healthData.services.xrpl = 'error';
    
    res.status(503).json(healthData);
  }
}));

/**
 * @route   GET /api/health/xrpl
 * @desc    XRPL specific health check
 * @access  Public  
 */
router.get('/xrpl', asyncHandler(async (req: Request, res: Response) => {
  try {
    const networkInfo = xrplService.getNetworkInfo();
    
    let balanceInfo = null;
    if (networkInfo.walletAddress) {
      try {
        balanceInfo = await xrplService.checkWalletBalance();
      } catch (error) {
        logger.warn('Could not fetch balance info:', error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'XRPL connection status',
      timestamp: new Date().toISOString(),
      xrpl: {
        network: networkInfo.network,
        serverUrl: networkInfo.serverUrl,
        walletAddress: networkInfo.walletAddress,
        connected: !!networkInfo.walletAddress,
        balance: balanceInfo
      }
    });
  } catch (error) {
    logger.error('XRPL health check error:', error);
    
    res.status(503).json({
      success: false,
      message: 'XRPL connection error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

export default router;
