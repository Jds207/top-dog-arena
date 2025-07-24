import { logger } from '../utils/logger';
import axios from 'axios';

/**
 * @fileoverview IPFS and Filecoin storage service for NFT images and metadata
 * 
 * This service provides comprehensive storage solutions for NFT assets:
 * - Primary storage via IPFS (Pinata)
 * - Backup storage via Filecoin (Lighthouse)
 * - Multiple gateway redundancy
 * - Availability monitoring
 * - Deal status tracking
 * 
 * @author Top Dog Arena
 * @version 1.0.0
 */

/**
 * Service for managing IPFS and Filecoin storage of NFT assets
 * 
 * Features:
 * - Upload images and metadata to IPFS via Pinata
 * - Create Filecoin storage deals via Lighthouse
 * - Test content availability across multiple gateways
 * - Monitor storage deal status
 * - Automatic fallback to IPFS-only if Filecoin fails
 * 
 * @example
 * ```typescript
 * // Basic IPFS upload
 * const ipfsUrl = await ipfsService.uploadImage(imageBuffer, 'nft.png');
 * 
 * // Upload with Filecoin backup
 * const result = await ipfsService.uploadToFilecoin(imageBuffer, 'nft.png');
 * console.log(result.ipfsUrl, result.filecoinDealId);
 * 
 * // Test availability
 * const availability = await ipfsService.testIPFSAvailability(cid);
 * ```
 */
export class IPFSService {
  /** Pinata API key for IPFS operations */
  private pinataApiKey: string;
  /** Pinata secret key for IPFS operations */
  private pinataSecretKey: string;
  /** Primary IPFS gateway URL */
  private pinataGateway: string;
  /** Lighthouse API key for Filecoin operations */
  private filecoinApiKey: string;
  /** Filecoin network selection (testnet/mainnet) */
  private filecoinNetwork: string;

  /**
   * Initialize IPFS service with environment configuration
   * 
   * Reads configuration from environment variables:
   * - PINATA_API_KEY: Pinata API key
   * - PINATA_SECRET_KEY: Pinata secret key  
   * - IPFS_GATEWAY: Primary IPFS gateway
   * - FILECOIN_API_KEY: Lighthouse API key
   * - FILECOIN_NETWORK: Network selection (testnet/mainnet)
   */
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || '';
    this.pinataGateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud';
    this.filecoinApiKey = process.env.FILECOIN_API_KEY || '';
    this.filecoinNetwork = process.env.FILECOIN_NETWORK || 'testnet';
    
    logger.info('🔧 IPFS Service initialized', {
      pinataConfigured: !!this.pinataApiKey,
      filecoinConfigured: !!this.filecoinApiKey,
      network: this.filecoinNetwork,
      gateway: this.pinataGateway
    });
  }

  /**
   * Upload image buffer to IPFS via Pinata
   * 
   * @param imageBuffer - Raw image data as Buffer
   * @param filename - Name for the uploaded file
   * @returns Promise resolving to IPFS URL
   * 
   * @throws {Error} When Pinata credentials are missing
   * @throws {Error} When upload fails
   * 
   * @example
   * ```typescript
   * const buffer = fs.readFileSync('image.png');
   * const url = await ipfsService.uploadImage(buffer, 'nft-image.png');
   * console.log('Image URL:', url);
   * ```
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      const error = new Error('IPFS service not configured - missing Pinata credentials');
      logger.error('❌ Upload failed: Missing credentials', { filename });
      throw error;
    }

    logger.info('📤 Starting image upload to IPFS', { 
      filename, 
      size: `${(imageBuffer.length / 1024).toFixed(2)}KB` 
    });

    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('file', blob, filename);

      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          type: 'nft-image',
          uploadedAt: new Date().toISOString(),
          size: imageBuffer.length
        }
      });
      formData.append('pinataMetadata', metadata);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${this.pinataGateway}/ipfs/${ipfsHash}`;
      const duration = Date.now() - startTime;
      
      logger.info('✅ Image uploaded to IPFS successfully', {
        filename,
        ipfsHash,
        ipfsUrl,
        duration: `${duration}ms`,
        size: `${(imageBuffer.length / 1024).toFixed(2)}KB`
      });
      
      return ipfsUrl;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      logger.error('❌ Failed to upload image to IPFS', {
        filename,
        duration: `${duration}ms`,
        error: errorMessage,
        stack: errorStack
      });
      throw error;
    }
  }

  /**
   * Upload metadata JSON to IPFS via Pinata
   * 
   * @param metadata - Metadata object to upload
   * @param name - Name identifier for the metadata
   * @returns Promise resolving to IPFS URL
   * 
   * @throws {Error} When Pinata credentials are missing
   * @throws {Error} When upload fails
   * 
   * @example
   * ```typescript
   * const metadata = { name: 'My NFT', description: 'Cool NFT' };
   * const url = await ipfsService.uploadMetadata(metadata, 'my-nft-metadata');
   * ```
   */
  async uploadMetadata(metadata: any, name: string): Promise<string> {
    const startTime = Date.now();
    
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      const error = new Error('IPFS service not configured - missing Pinata credentials');
      logger.error('❌ Metadata upload failed: Missing credentials', { name });
      throw error;
    }

    logger.info('📋 Starting metadata upload to IPFS', { 
      name, 
      size: `${JSON.stringify(metadata).length} bytes`
    });

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${this.pinataGateway}/ipfs/${ipfsHash}`;
      const duration = Date.now() - startTime;
      
      logger.info('✅ Metadata uploaded to IPFS successfully', {
        name,
        ipfsHash,
        ipfsUrl,
        duration: `${duration}ms`
      });
      
      return ipfsUrl;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('❌ Failed to upload metadata to IPFS', {
        name,
        duration: `${duration}ms`,
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * Download image from URL and upload to IPFS
   */
  async uploadImageFromUrl(imageUrl: string, filename?: string): Promise<string> {
    try {
      logger.info(`📥 Downloading image from: ${imageUrl}`);
      
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 second timeout
      });

      const imageBuffer = Buffer.from(response.data);
      const finalFilename = filename || `nft-image-${Date.now()}.png`;
      
      return await this.uploadImage(imageBuffer, finalFilename);
    } catch (error) {
      logger.error(`❌ Failed to download and upload image from ${imageUrl}:`, error);
      throw error;
    }
  }

  /**
   * Check if IPFS service is configured
   */
  isConfigured(): boolean {
    return !!(this.pinataApiKey && this.pinataSecretKey);
  }

  /**
   * Create a mutable reference using IPNS (requires additional setup)
   * Note: This would allow updating what the name points to
   */
  async createMutableReference(ipfsHash: string, name: string): Promise<string> {
    // This would require additional Pinata API calls for IPNS
    // For now, returning the immutable IPFS URL
    logger.warn('🔄 IPNS not implemented - images are immutable once uploaded');
    return `${this.pinataGateway}/ipfs/${ipfsHash}`;
  }

  /**
   * Check if a URL is an IPFS URL
   */
  isIPFSUrl(url: string): boolean {
    return url.includes('/ipfs/') || url.startsWith('ipfs://');
  }

  /**
   * Convert IPFS URL to different gateway
   */
  convertGateway(ipfsUrl: string, newGateway?: string): string {
    const gateway = newGateway || this.pinataGateway;
    
    // Extract hash from various IPFS URL formats
    const hashMatch = ipfsUrl.match(/(?:ipfs\/|ipfs:\/\/)([a-zA-Z0-9]+)/);
    if (hashMatch) {
      return `${gateway}/ipfs/${hashMatch[1]}`;
    }
    
    return ipfsUrl; // Return original if not IPFS format
  }

  /**
   * Get multiple gateway URLs for redundancy
   * If one gateway goes down, others can still serve the content
   */
  getRedundantGateways(ipfsHash: string): string[] {
    const gateways = [
      'https://gateway.pinata.cloud',
      'https://ipfs.io', 
      'https://cloudflare-ipfs.com',
      'https://dweb.link',
      'https://w3s.link',
      'https://nftstorage.link'
    ];
    
    return gateways.map(gateway => `${gateway}/ipfs/${ipfsHash}`);
  }

  /**
   * Upload to Filecoin network via Lighthouse
   * Lighthouse provides easy Filecoin integration with IPFS
   */
  async uploadToFilecoin(imageBuffer: Buffer, filename: string): Promise<{
    ipfsUrl: string;
    filecoinDealId?: string;
    cid: string;
    lighthouseUrl?: string;
  }> {
    try {
      // First upload to IPFS via Pinata
      const ipfsUrl = await this.uploadImage(imageBuffer, filename);
      const cid = this.extractCIDFromUrl(ipfsUrl);

      if (!this.filecoinApiKey) {
        logger.warn('🟡 Filecoin API key not configured, using IPFS only');
        return { ipfsUrl, cid };
      }

      // Upload to Lighthouse for Filecoin storage
      const lighthouseResult = await this.uploadToLighthouse(imageBuffer, filename);
      
      logger.info(`🔥 Uploaded to Filecoin via Lighthouse - CID: ${cid}`);
      return {
        ipfsUrl,
        filecoinDealId: lighthouseResult.dealId,
        cid,
        lighthouseUrl: lighthouseResult.url
      };
    } catch (error) {
      logger.error('❌ Failed to upload to Filecoin:', error);
      // Fallback to IPFS only
      const ipfsUrl = await this.uploadImage(imageBuffer, filename);
      const cid = this.extractCIDFromUrl(ipfsUrl);
      return { ipfsUrl, cid };
    }
  }

  /**
   * Upload to Lighthouse (Filecoin service)
   */
  private async uploadToLighthouse(imageBuffer: Buffer, filename: string): Promise<{
    url: string;
    dealId: string;
    cid: string;
  }> {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('file', blob, filename);

      const response = await axios.post(
        'https://node.lighthouse.storage/api/v0/add',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.filecoinApiKey}`,
          }
        }
      );

      const { Hash: cid, Name: name } = response.data;
      const lighthouseUrl = `https://gateway.lighthouse.storage/ipfs/${cid}`;

      // Create Filecoin deal
      const dealResponse = await axios.post(
        'https://api.lighthouse.storage/api/lighthouse/deal',
        {
          cid,
          duration: 518400, // ~6 months
          replication: 2
        },
        {
          headers: {
            'Authorization': `Bearer ${this.filecoinApiKey}`,
          }
        }
      );

      return {
        url: lighthouseUrl,
        dealId: dealResponse.data.dealId || 'pending',
        cid
      };
    } catch (error) {
      logger.error('❌ Lighthouse upload failed:', error);
      throw error;
    }
  }

  /**
   * Check Filecoin deal status via Lighthouse
   */
  async checkFilecoinDealStatus(dealId: string): Promise<{
    status: 'pending' | 'active' | 'expired' | 'failed';
    cid?: string;
    replication?: number;
  }> {
    try {
      const response = await axios.get(
        `https://api.lighthouse.storage/api/lighthouse/deal/status/${dealId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.filecoinApiKey}`,
          }
        }
      );
      
      return {
        status: response.data.status,
        cid: response.data.cid,
        replication: response.data.replication
      };
    } catch (error) {
      logger.error(`❌ Failed to check deal status for ${dealId}:`, error);
      return { status: 'failed' };
    }
  }

  /**
   * Extract CID from IPFS URL
   * 
   * @param ipfsUrl - IPFS URL to extract CID from
   * @returns CID string or empty string if not found
   * 
   * @example
   * ```typescript
   * const cid = ipfsService.extractCIDFromUrl('https://gateway.pinata.cloud/ipfs/QmHash123');
   * console.log(cid); // 'QmHash123'
   * ```
   */
  extractCIDFromUrl(ipfsUrl: string): string {
    // Match both /ipfs/ and ipfs:// patterns
    const match = ipfsUrl.match(/(?:\/ipfs\/|ipfs:\/\/)([a-zA-Z0-9]+)/);
    return match ? match[1] : '';
  }

  /**
   * Test if an IPFS hash is accessible across multiple gateways
   * 
   * @param ipfsHash - IPFS hash to test
   * @returns Promise resolving to availability status
   * 
   * @example
   * ```typescript
   * const result = await ipfsService.testIPFSAvailability('QmHash123');
   * console.log(`Available on ${result.workingGateways.length} gateways`);
   * ```
   */
  async testIPFSAvailability(ipfsHash: string): Promise<{
    available: boolean;
    workingGateways: string[];
    failedGateways: string[];
  }> {
    const startTime = Date.now();
    const gateways = this.getRedundantGateways(ipfsHash);
    const workingGateways: string[] = [];
    const failedGateways: string[] = [];

    logger.info('🔍 Testing IPFS availability across gateways', {
      ipfsHash,
      gatewayCount: gateways.length
    });

    await Promise.all(
      gateways.map(async (gatewayUrl) => {
        try {
          const response = await axios.head(gatewayUrl, { timeout: 5000 });
          if (response.status === 200) {
            workingGateways.push(gatewayUrl);
            logger.debug('✅ Gateway working', { gatewayUrl });
          } else {
            failedGateways.push(gatewayUrl);
            logger.debug('❌ Gateway failed', { gatewayUrl, status: response.status });
          }
        } catch (error) {
          failedGateways.push(gatewayUrl);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.debug('❌ Gateway error', { gatewayUrl, error: errorMessage });
        }
      })
    );

    const duration = Date.now() - startTime;
    const result = {
      available: workingGateways.length > 0,
      workingGateways,
      failedGateways
    };

    logger.info('🔍 IPFS availability test completed', {
      ipfsHash,
      available: result.available,
      workingCount: workingGateways.length,
      failedCount: failedGateways.length,
      duration: `${duration}ms`
    });

    return result;
  }
}

// Singleton instance
export const ipfsService = new IPFSService();
