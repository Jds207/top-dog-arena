import { Request, Response } from 'express';
import { xrplService } from '../services/xrpl.service';
import { logger } from '../utils/logger';
import { MintNFTRequest, NFTMetadata } from '../services/xrpl.service';

export interface CreateNFTRequest extends Request {
  body: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
    external_url?: string;
    animation_url?: string;
    transferFee?: number;
    recipient?: string;
    flags?: number;
  };
}

export interface NFTResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

/**
 * Create/Mint a new NFT on XRPL
 */
export const createNFT = async (req: CreateNFTRequest, res: Response): Promise<void> => {
  try {
    const { 
      name, 
      description, 
      image, 
      attributes, 
      external_url, 
      animation_url, 
      transferFee, 
      recipient, 
      flags 
    } = req.body;

    logger.info(`📝 Creating NFT: ${name}`);

    // Prepare metadata
    const metadata: NFTMetadata = {
      name,
      description,
      image,
      attributes,
      external_url,
      animation_url
    };

    // Prepare mint request
    const mintRequest: MintNFTRequest = {
      metadata,
      transferFee,
      recipient,
      flags
    };

    // Mint the NFT
    const result = await xrplService.mintNFT(mintRequest);

    if (result.success) {
      const response: NFTResponse = {
        success: true,
        data: {
          nftId: result.nftId,
          txHash: result.txHash,
          fee: result.fee,
          metadata
        },
        message: 'NFT created successfully'
      };

      logger.info(`✅ NFT created: ${result.nftId}`);
      res.status(201).json(response);
    } else {
      const response: NFTResponse = {
        success: false,
        error: result.error,
        message: 'Failed to create NFT'
      };

      logger.error(`❌ NFT creation failed: ${result.error}`);
      res.status(400).json(response);
    }

  } catch (error) {
    logger.error('❌ Error in createNFT controller:', error);
    
    const response: NFTResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to create NFT'
    };

    res.status(500).json(response);
  }
};

/**
 * Get NFT details by ID
 */
export const getNFTById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nftId } = req.params;

    if (!nftId) {
      const response: NFTResponse = {
        success: false,
        error: 'NFT ID is required',
        message: 'Invalid request'
      };
      res.status(400).json(response);
      return;
    }

    logger.info(`🔍 Fetching NFT details: ${nftId}`);

    const nftDetails = await xrplService.getNFTDetails(nftId);

    const response: NFTResponse = {
      success: true,
      data: nftDetails,
      message: 'NFT details retrieved successfully'
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error(`❌ Error fetching NFT ${req.params.nftId}:`, error);
    
    const response: NFTResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to fetch NFT details'
    };

    res.status(500).json(response);
  }
};

/**
 * Get all NFTs owned by an account
 */
export const getAccountNFTs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { account } = req.params;

    if (!account) {
      const response: NFTResponse = {
        success: false,
        error: 'Account address is required',
        message: 'Invalid request'
      };
      res.status(400).json(response);
      return;
    }

    logger.info(`🔍 Fetching NFTs for account: ${account}`);

    const accountNFTs = await xrplService.getAccountNFTs(account);

    const response: NFTResponse = {
      success: true,
      data: {
        account,
        nfts: accountNFTs,
        count: accountNFTs.length
      },
      message: 'Account NFTs retrieved successfully'
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error(`❌ Error fetching NFTs for account ${req.params.account}:`, error);
    
    const response: NFTResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to fetch account NFTs'
    };

    res.status(500).json(response);
  }
};

/**
 * Get wallet balance and network info
 */
export const getWalletInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('🔍 Fetching wallet info');

    const networkInfo = xrplService.getNetworkInfo();
    
    let balanceInfo = null;
    if (networkInfo.walletAddress) {
      try {
        balanceInfo = await xrplService.checkWalletBalance();
      } catch (error) {
        logger.warn('Could not fetch balance info:', error);
      }
    }

    const response: NFTResponse = {
      success: true,
      data: {
        network: networkInfo,
        balance: balanceInfo
      },
      message: 'Wallet info retrieved successfully'
    };

    res.status(200).json(response);

  } catch (error) {
    logger.error('❌ Error fetching wallet info:', error);
    
    const response: NFTResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to fetch wallet info'
    };

    res.status(500).json(response);
  }
};

/**
 * Batch mint multiple NFTs
 */
export const batchCreateNFTs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nfts } = req.body;

    if (!Array.isArray(nfts) || nfts.length === 0) {
      const response: NFTResponse = {
        success: false,
        error: 'Array of NFTs is required',
        message: 'Invalid request'
      };
      res.status(400).json(response);
      return;
    }

    if (nfts.length > 10) { // Limit batch size
      const response: NFTResponse = {
        success: false,
        error: 'Maximum batch size is 10 NFTs',
        message: 'Invalid request'
      };
      res.status(400).json(response);
      return;
    }

    logger.info(`📝 Batch creating ${nfts.length} NFTs`);

    const results = [];
    const errors = [];

    for (let i = 0; i < nfts.length; i++) {
      const nftData = nfts[i];
      
      try {
        const metadata: NFTMetadata = {
          name: nftData.name,
          description: nftData.description,
          image: nftData.image,
          attributes: nftData.attributes,
          external_url: nftData.external_url,
          animation_url: nftData.animation_url
        };

        const mintRequest: MintNFTRequest = {
          metadata,
          transferFee: nftData.transferFee,
          recipient: nftData.recipient,
          flags: nftData.flags
        };

        const result = await xrplService.mintNFT(mintRequest);
        
        if (result.success) {
          results.push({
            index: i,
            nftId: result.nftId,
            txHash: result.txHash,
            fee: result.fee,
            metadata
          });
        } else {
          errors.push({
            index: i,
            error: result.error,
            nftData
          });
        }

        // Small delay between mints to avoid overwhelming the network
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          nftData
        });
      }
    }

    const response: NFTResponse = {
      success: errors.length === 0,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: nfts.length,
          successful: results.length,
          failed: errors.length
        }
      },
      message: `Batch creation completed: ${results.length}/${nfts.length} successful`
    };

    const statusCode = errors.length === 0 ? 201 : (results.length > 0 ? 207 : 400);
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('❌ Error in batch NFT creation:', error);
    
    const response: NFTResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to create NFTs'
    };

    res.status(500).json(response);
  }
};
