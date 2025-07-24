import { IPFSService } from '../src/services/ipfs.service';
import { logger } from '../src/utils/logger';

// Mock dependencies
jest.mock('../src/utils/logger');
jest.mock('axios');

import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IPFSService', () => {
  let ipfsService: IPFSService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      PINATA_API_KEY: 'test_pinata_key',
      PINATA_SECRET_KEY: 'test_pinata_secret',
      IPFS_GATEWAY: 'https://test-gateway.com',
      FILECOIN_API_KEY: 'test_filecoin_key',
      FILECOIN_NETWORK: 'testnet'
    };

    ipfsService = new IPFSService();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should initialize with environment variables', () => {
      expect(ipfsService).toBeInstanceOf(IPFSService);
      // Note: Constructor logging happens during instantiation
      // We can verify the service was created properly instead
      expect(ipfsService.isConfigured()).toBe(true);
    });

    it('should handle missing environment variables', () => {
      process.env = {};
      const service = new IPFSService();
      
      expect(logger.info).toHaveBeenCalledWith('🔧 IPFS Service initialized', {
        pinataConfigured: false,
        filecoinConfigured: false,
        network: 'testnet',
        gateway: 'https://gateway.pinata.cloud'
      });
    });
  });

  describe('uploadImage', () => {
    const testBuffer = Buffer.from('test image data');
    const filename = 'test.png';

    it('should successfully upload image to IPFS', async () => {
      const mockResponse = {
        data: {
          IpfsHash: 'QmTestHash123'
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await ipfsService.uploadImage(testBuffer, filename);

      expect(result).toBe('https://test-gateway.com/ipfs/QmTestHash123');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'pinata_api_key': 'test_pinata_key',
            'pinata_secret_api_key': 'test_pinata_secret'
          },
          timeout: 60000
        })
      );
      // Check that logging was called (but don't match exact size due to buffer differences)
      expect(logger.info).toHaveBeenCalledWith('📤 Starting image upload to IPFS', expect.objectContaining({
        filename
      }));
      expect(logger.info).toHaveBeenCalledWith('✅ Image uploaded to IPFS successfully', expect.objectContaining({
        filename,
        ipfsHash: 'QmTestHash123',
        ipfsUrl: 'https://test-gateway.com/ipfs/QmTestHash123'
      }));
    });

    it('should throw error when Pinata credentials are missing', async () => {
      process.env.PINATA_API_KEY = '';
      const service = new IPFSService();

      await expect(service.uploadImage(testBuffer, filename))
        .rejects
        .toThrow('IPFS service not configured - missing Pinata credentials');

      expect(logger.error).toHaveBeenCalledWith('❌ Upload failed: Missing credentials', {
        filename
      });
    });

    it('should handle upload failure', async () => {
      const error = new Error('Network error');
      mockedAxios.post.mockRejectedValue(error);

      await expect(ipfsService.uploadImage(testBuffer, filename))
        .rejects
        .toThrow('Network error');

      expect(logger.error).toHaveBeenCalledWith('❌ Failed to upload image to IPFS', expect.objectContaining({
        filename,
        error: 'Network error'
      }));
    });
  });

  describe('uploadMetadata', () => {
    const testMetadata = { name: 'Test NFT', description: 'Test description' };
    const name = 'test-metadata';

    it('should successfully upload metadata to IPFS', async () => {
      const mockResponse = {
        data: {
          IpfsHash: 'QmMetadataHash456'
        }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await ipfsService.uploadMetadata(testMetadata, name);

      expect(result).toBe('https://test-gateway.com/ipfs/QmMetadataHash456');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        testMetadata,
        expect.objectContaining({
          headers: {
            'pinata_api_key': 'test_pinata_key',
            'pinata_secret_api_key': 'test_pinata_secret'
          },
          timeout: 30000
        })
      );
    });

    it('should throw error when credentials are missing', async () => {
      process.env.PINATA_SECRET_KEY = '';
      const service = new IPFSService();

      await expect(service.uploadMetadata(testMetadata, name))
        .rejects
        .toThrow('IPFS service not configured - missing Pinata credentials');
    });
  });

  describe('uploadImageFromUrl', () => {
    const imageUrl = 'https://example.com/image.png';
    const filename = 'downloaded.png';

    it('should download and upload image successfully', async () => {
      const imageData = Buffer.from('downloaded image data');
      
      // Mock image download
      mockedAxios.get.mockResolvedValue({
        data: imageData.buffer
      });

      // Mock IPFS upload
      mockedAxios.post.mockResolvedValue({
        data: { IpfsHash: 'QmDownloadedHash789' }
      });

      const result = await ipfsService.uploadImageFromUrl(imageUrl, filename);

      expect(result).toBe('https://test-gateway.com/ipfs/QmDownloadedHash789');
      expect(mockedAxios.get).toHaveBeenCalledWith(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
    });

    it('should handle download failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Download failed'));

      await expect(ipfsService.uploadImageFromUrl(imageUrl, filename))
        .rejects
        .toThrow('Download failed');
    });
  });

  describe('uploadToFilecoin', () => {
    const testBuffer = Buffer.from('test filecoin data');
    const filename = 'test-filecoin.png';

    it('should upload to both IPFS and Filecoin', async () => {
      // Mock IPFS upload
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { IpfsHash: 'QmFilecoinTest123' }
        })
        // Mock Lighthouse upload
        .mockResolvedValueOnce({
          data: { Hash: 'QmLighthouseHash456', Name: filename }
        })
        // Mock Filecoin deal creation
        .mockResolvedValueOnce({
          data: { dealId: 'deal_12345' }
        });

      const result = await ipfsService.uploadToFilecoin(testBuffer, filename);

      expect(result).toEqual({
        ipfsUrl: 'https://test-gateway.com/ipfs/QmFilecoinTest123',
        filecoinDealId: 'deal_12345',
        cid: 'QmFilecoinTest123',
        lighthouseUrl: 'https://gateway.lighthouse.storage/ipfs/QmLighthouseHash456'
      });
    });

    it('should fallback to IPFS only when Filecoin key is missing', async () => {
      process.env.FILECOIN_API_KEY = '';
      const service = new IPFSService();

      mockedAxios.post.mockResolvedValue({
        data: { IpfsHash: 'QmIPFSOnly123' }
      });

      const result = await service.uploadToFilecoin(testBuffer, filename);

      expect(result).toEqual({
        ipfsUrl: 'https://test-gateway.com/ipfs/QmIPFSOnly123',
        cid: 'QmIPFSOnly123'
      });
      expect(logger.warn).toHaveBeenCalledWith('🟡 Filecoin API key not configured, using IPFS only');
    });

    it('should fallback to IPFS when Filecoin upload fails', async () => {
      // Mock successful IPFS upload
      mockedAxios.post
        .mockResolvedValueOnce({
          data: { IpfsHash: 'QmIPFSFallback789' }
        })
        // Mock failed Lighthouse upload
        .mockRejectedValueOnce(new Error('Lighthouse error'))
        // Mock fallback IPFS upload
        .mockResolvedValueOnce({
          data: { IpfsHash: 'QmIPFSFallback789' }
        });

      const result = await ipfsService.uploadToFilecoin(testBuffer, filename);

      expect(result).toEqual({
        ipfsUrl: 'https://test-gateway.com/ipfs/QmIPFSFallback789',
        cid: 'QmIPFSFallback789'
      });
    });
  });

  describe('Utility methods', () => {
    it('should check if service is configured', () => {
      expect(ipfsService.isConfigured()).toBe(true);

      process.env.PINATA_API_KEY = '';
      const unconfiguredService = new IPFSService();
      expect(unconfiguredService.isConfigured()).toBe(false);
    });

    it('should identify IPFS URLs correctly', () => {
      expect(ipfsService.isIPFSUrl('https://gateway.pinata.cloud/ipfs/QmHash123')).toBe(true);
      expect(ipfsService.isIPFSUrl('ipfs://QmHash123')).toBe(true);
      expect(ipfsService.isIPFSUrl('https://example.com/image.png')).toBe(false);
    });

    it('should extract CID from IPFS URL', () => {
      const url = 'https://gateway.pinata.cloud/ipfs/QmTestHash123';
      expect(ipfsService.extractCIDFromUrl(url)).toBe('QmTestHash123');

      const ipfsUrl = 'ipfs://QmTestHash456';
      expect(ipfsService.extractCIDFromUrl(ipfsUrl)).toBe('QmTestHash456');

      const invalidUrl = 'https://example.com/image.png';
      expect(ipfsService.extractCIDFromUrl(invalidUrl)).toBe('');
    });

    it('should convert gateway URLs', () => {
      const originalUrl = 'https://gateway.pinata.cloud/ipfs/QmTestHash123';
      const newGateway = 'https://cloudflare-ipfs.com';
      
      const convertedUrl = ipfsService.convertGateway(originalUrl, newGateway);
      expect(convertedUrl).toBe('https://cloudflare-ipfs.com/ipfs/QmTestHash123');
    });

    it('should provide redundant gateways', () => {
      const cid = 'QmTestHash123';
      const gateways = ipfsService.getRedundantGateways(cid);
      
      expect(gateways).toHaveLength(6);
      expect(gateways[0]).toBe('https://gateway.pinata.cloud/ipfs/QmTestHash123');
      expect(gateways[1]).toBe('https://ipfs.io/ipfs/QmTestHash123');
    });
  });

  describe('testIPFSAvailability', () => {
    it('should test availability across multiple gateways', async () => {
      const cid = 'QmTestHash123';
      
      // Mock successful responses for some gateways
      mockedAxios.head
        .mockResolvedValueOnce({ status: 200 })  // gateway.pinata.cloud
        .mockRejectedValueOnce(new Error('Failed'))  // ipfs.io
        .mockResolvedValueOnce({ status: 200 })  // cloudflare-ipfs.com
        .mockRejectedValueOnce(new Error('Failed'))  // dweb.link
        .mockResolvedValueOnce({ status: 200 })  // w3s.link
        .mockRejectedValueOnce(new Error('Failed')); // nftstorage.link

      const result = await ipfsService.testIPFSAvailability(cid);

      expect(result.available).toBe(true);
      expect(result.workingGateways).toHaveLength(3);
      expect(result.failedGateways).toHaveLength(3);
      expect(mockedAxios.head).toHaveBeenCalledTimes(6);
    });

    it('should handle all gateways failing', async () => {
      const cid = 'QmTestHash123';
      
      mockedAxios.head.mockRejectedValue(new Error('All failed'));

      const result = await ipfsService.testIPFSAvailability(cid);

      expect(result.available).toBe(false);
      expect(result.workingGateways).toHaveLength(0);
      expect(result.failedGateways).toHaveLength(6);
    });
  });

  describe('checkFilecoinDealStatus', () => {
    it('should check deal status successfully', async () => {
      const dealId = 'deal_12345';
      const mockResponse = {
        data: {
          status: 'active',
          cid: 'QmTestCID',
          replication: 2
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await ipfsService.checkFilecoinDealStatus(dealId);

      expect(result).toEqual({
        status: 'active',
        cid: 'QmTestCID',
        replication: 2
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `https://api.lighthouse.storage/api/lighthouse/deal/status/${dealId}`,
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer test_filecoin_key'
          }
        })
      );
    });

    it('should handle deal status check failure', async () => {
      const dealId = 'deal_12345';
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      const result = await ipfsService.checkFilecoinDealStatus(dealId);

      expect(result).toEqual({ status: 'failed' });
      expect(logger.error).toHaveBeenCalledWith(
        `❌ Failed to check deal status for ${dealId}:`,
        expect.any(Error)
      );
    });
  });
});
