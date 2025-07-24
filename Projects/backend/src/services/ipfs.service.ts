import { logger } from '../utils/logger';
import axios from 'axios';

export class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataGateway: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY || '';
    this.pinataGateway = process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud';
  }

  /**
   * Upload image buffer to IPFS via Pinata
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('IPFS service not configured - missing Pinata credentials');
    }

    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer]);
      formData.append('file', blob, filename);

      const metadata = JSON.stringify({
        name: filename,
        keyvalues: {
          type: 'nft-image',
          uploadedAt: new Date().toISOString()
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
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${this.pinataGateway}/ipfs/${ipfsHash}`;
      
      logger.info(`📎 Image uploaded to IPFS: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error) {
      logger.error('❌ Failed to upload image to IPFS:', error);
      throw error;
    }
  }

  /**
   * Upload metadata JSON to IPFS
   */
  async uploadMetadata(metadata: any, name: string): Promise<string> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('IPFS service not configured - missing Pinata credentials');
    }

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey,
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `${this.pinataGateway}/ipfs/${ipfsHash}`;
      
      logger.info(`📄 Metadata uploaded to IPFS: ${ipfsUrl}`);
      return ipfsUrl;
    } catch (error) {
      logger.error('❌ Failed to upload metadata to IPFS:', error);
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
   * Test if an IPFS hash is accessible across multiple gateways
   */
  async testIPFSAvailability(ipfsHash: string): Promise<{
    available: boolean;
    workingGateways: string[];
    failedGateways: string[];
  }> {
    const gateways = this.getRedundantGateways(ipfsHash);
    const workingGateways: string[] = [];
    const failedGateways: string[] = [];

    await Promise.all(
      gateways.map(async (gatewayUrl) => {
        try {
          const response = await axios.head(gatewayUrl, { timeout: 5000 });
          if (response.status === 200) {
            workingGateways.push(gatewayUrl);
          } else {
            failedGateways.push(gatewayUrl);
          }
        } catch (error) {
          failedGateways.push(gatewayUrl);
        }
      })
    );

    return {
      available: workingGateways.length > 0,
      workingGateways,
      failedGateways
    };
  }
}

// Singleton instance
export const ipfsService = new IPFSService();
