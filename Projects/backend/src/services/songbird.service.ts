import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export interface SongbirdNFTWrapper {
  tokenId: string;
  xrplNftId: string;
  songbirdTokenId: string;
  contractAddress: string;
  owner: string;
  wrapped: boolean;
  wrappedAt?: Date;
  unwrappedAt?: Date;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
}

export interface WrapNFTRequest {
  xrplNftId: string;
  xrplOwnerAddress: string;
  songbirdRecipientAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
}

export class SongbirdService {
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private contract!: ethers.Contract;
  private connected: boolean = false;

  // Smart contract ABI for NFT wrapper
  private readonly contractABI = [
    // ERC721 Standard Functions
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function balanceOf(address owner) view returns (uint256)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data)",
    
    // Custom Wrapper Functions
    "function wrapXRPLNFT(string calldata xrplNftId, string calldata metadataURI, address recipient) returns (uint256)",
    "function unwrapNFT(uint256 tokenId) returns (string)",
    "function getXRPLNftId(uint256 tokenId) view returns (string)",
    "function isWrapped(uint256 tokenId) view returns (bool)",
    "function getWrapperInfo(uint256 tokenId) view returns (string, bool, uint256)",
    
    // Admin Functions
    "function setBaseURI(string calldata baseURI)",
    "function pause()",
    "function unpause()",
    "function paused() view returns (bool)",
    
    // Events
    "event NFTWrapped(uint256 indexed tokenId, string indexed xrplNftId, address indexed recipient)",
    "event NFTUnwrapped(uint256 indexed tokenId, string indexed xrplNftId, address indexed owner)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
  ];

  constructor() {
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      const rpcUrl = process.env.SGB_RPC_URL || 'https://songbird-api.flare.network/ext/bc/C/rpc';
      const privateKey = process.env.SGB_PRIVATE_KEY;
      const contractAddress = process.env.SGB_CONTRACT_ADDRESS;

      if (!privateKey) {
        logger.warn('⚠️ SGB_PRIVATE_KEY environment variable not set - Songbird features disabled');
        this.connected = false;
        return;
      }

      if (!contractAddress) {
        logger.warn('⚠️ SGB_CONTRACT_ADDRESS environment variable not set - Songbird features disabled');
        this.connected = false;
        return;
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      // Initialize wallet
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Initialize contract
      this.contract = new ethers.Contract(contractAddress, this.contractABI, this.wallet);
      
      // Test connection
      await this.provider.getNetwork();
      
      this.connected = true;
      logger.info(`✅ Connected to Songbird network: ${rpcUrl}`);
      logger.info(`🏦 Wallet address: ${this.wallet.address}`);
      logger.info(`📄 Contract address: ${contractAddress}`);

    } catch (error) {
      this.connected = false;
      logger.warn('⚠️ Failed to connect to Songbird network:', error);
      logger.warn('⚠️ Songbird features will be disabled');
      // Don't throw error - just disable Songbird features
    }
  }

  async getConnectionStatus(): Promise<{
    connected: boolean;
    network?: string;
    walletAddress?: string;
    contractAddress?: string;
    balance?: string;
  }> {
    try {
      if (!this.connected) {
        return { connected: false };
      }

      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      
      return {
        connected: true,
        network: network.name,
        walletAddress: this.wallet.address,
        contractAddress: await this.contract.getAddress(),
        balance: ethers.formatEther(balance) + ' SGB'
      };
    } catch (error) {
      logger.error('❌ Error getting Songbird connection status:', error);
      return { connected: false };
    }
  }

  async wrapXRPLNFT(request: WrapNFTRequest): Promise<{
    success: boolean;
    songbirdTokenId?: string;
    transactionHash?: string;
    gasUsed?: string;
    error?: string;
  }> {
    try {
      if (!this.connected) {
        throw new Error('Not connected to Songbird network');
      }

      logger.info(`🎁 Wrapping XRPL NFT: ${request.xrplNftId}`);
      
      // Create metadata URI (this could be IPFS or your API)
      const metadataURI = await this.createMetadataURI(request.metadata);
      
      // Call smart contract to wrap NFT
      const tx = await this.contract.wrapXRPLNFT(
        request.xrplNftId,
        metadataURI,
        request.songbirdRecipientAddress
      );
      
      logger.info(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      // Extract token ID from events
      const transferEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );
      
      let songbirdTokenId = '0';
      if (transferEvent) {
        songbirdTokenId = ethers.getBigInt(transferEvent.topics[3]).toString();
      }
      
      logger.info(`✅ NFT wrapped successfully! Songbird Token ID: ${songbirdTokenId}`);
      
      return {
        success: true,
        songbirdTokenId,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      logger.error('❌ Error wrapping XRPL NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async unwrapNFT(songbirdTokenId: string): Promise<{
    success: boolean;
    xrplNftId?: string;
    transactionHash?: string;
    gasUsed?: string;
    error?: string;
  }> {
    try {
      if (!this.connected) {
        throw new Error('Not connected to Songbird network');
      }

      logger.info(`📤 Unwrapping Songbird NFT: ${songbirdTokenId}`);
      
      // Call smart contract to unwrap NFT
      const tx = await this.contract.unwrapNFT(songbirdTokenId);
      
      logger.info(`📝 Unwrap transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Get XRPL NFT ID from contract
      const xrplNftId = await this.contract.getXRPLNftId(songbirdTokenId);
      
      logger.info(`✅ NFT unwrapped successfully! XRPL NFT ID: ${xrplNftId}`);
      
      return {
        success: true,
        xrplNftId,
        transactionHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      logger.error('❌ Error unwrapping NFT:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getWrappedNFTInfo(songbirdTokenId: string): Promise<{
    success: boolean;
    info?: {
      xrplNftId: string;
      isWrapped: boolean;
      owner: string;
      tokenURI: string;
      metadata?: any;
    };
    error?: string;
  }> {
    try {
      if (!this.connected) {
        throw new Error('Not connected to Songbird network');
      }

      const [xrplNftId, isWrapped] = await this.contract.getWrapperInfo(songbirdTokenId);
      const owner = await this.contract.ownerOf(songbirdTokenId);
      const tokenURI = await this.contract.tokenURI(songbirdTokenId);
      
      // Fetch metadata if URI is available
      let metadata;
      if (tokenURI) {
        try {
          const response = await fetch(tokenURI);
          metadata = await response.json();
        } catch (e) {
          logger.warn(`⚠️ Could not fetch metadata from ${tokenURI}`);
        }
      }
      
      return {
        success: true,
        info: {
          xrplNftId,
          isWrapped,
          owner,
          tokenURI,
          metadata
        }
      };
      
    } catch (error) {
      logger.error('❌ Error getting wrapped NFT info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getWalletNFTs(walletAddress: string): Promise<{
    success: boolean;
    nfts?: Array<{
      tokenId: string;
      xrplNftId: string;
      isWrapped: boolean;
      tokenURI: string;
      metadata?: any;
    }>;
    error?: string;
  }> {
    try {
      if (!this.connected) {
        throw new Error('Not connected to Songbird network');
      }

      const balance = await this.contract.balanceOf(walletAddress);
      const nfts: Array<{
        tokenId: string;
        xrplNftId: string;
        isWrapped: boolean;
        tokenURI: string;
        metadata?: any;
      }> = [];
      
      // Note: This is a simplified approach. In production, you'd want to use events or indexing
      // to efficiently get all tokens owned by an address
      for (let i = 0; i < balance; i++) {
        // This would require implementing tokenOfOwnerByIndex in the contract
        // For now, this is a placeholder structure
      }
      
      return {
        success: true,
        nfts
      };
      
    } catch (error) {
      logger.error('❌ Error getting wallet NFTs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async createMetadataURI(metadata: any): Promise<string> {
    // In a real implementation, this would upload to IPFS or your metadata service
    // For now, return a placeholder URI
    const metadataId = ethers.id(JSON.stringify(metadata)).slice(0, 10);
    return `https://api.topdogarena.com/metadata/${metadataId}`;
  }

  async getGasEstimate(operation: 'wrap' | 'unwrap'): Promise<{
    gasLimit: string;
    gasPrice: string;
    estimatedCost: string;
  }> {
    try {
      const gasPrice = await this.provider.getFeeData();
      let gasLimit = '0';
      
      switch (operation) {
        case 'wrap':
          gasLimit = '150000'; // Estimated gas for wrapping
          break;
        case 'unwrap':
          gasLimit = '100000'; // Estimated gas for unwrapping
          break;
      }
      
      const estimatedCost = ethers.formatEther(
        BigInt(gasLimit) * (gasPrice.gasPrice || BigInt(0))
      );
      
      return {
        gasLimit,
        gasPrice: gasPrice.gasPrice?.toString() || '0',
        estimatedCost: estimatedCost + ' SGB'
      };
      
    } catch (error) {
      logger.error('❌ Error estimating gas:', error);
      throw error;
    }
  }
}

export const songbirdService = new SongbirdService();
