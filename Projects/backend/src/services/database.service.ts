import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('🔌 Database disconnected');
    } catch (error) {
      logger.error('❌ Failed to disconnect from database:', error);
    }
  }

  // Account management
  async createAccount(data: {
    address: string;
    network?: string;
    publicKey?: string;
    privateKey?: string;
    seed?: string;
    balance?: string;
    balanceXRP?: string;
    isOwned?: boolean;
    nickname?: string;
    description?: string;
  }) {
    try {
      const account = await this.prisma.account.create({
        data: {
          address: data.address,
          network: data.network || 'testnet',
          publicKey: data.publicKey,
          privateKey: data.privateKey,
          seed: data.seed,
          balance: data.balance,
          balanceXRP: data.balanceXRP,
          isOwned: data.isOwned || false,
          nickname: data.nickname,
          description: data.description,
        },
      });
      
      logger.info(`📝 Created account record: ${data.address}`);
      return account;
    } catch (error) {
      logger.error('❌ Failed to create account:', error);
      throw error;
    }
  }

  async getAccount(address: string) {
    try {
      return await this.prisma.account.findUnique({
        where: { address },
        include: {
          nftsOwned: true,
          nftsIssued: true,
        },
      });
    } catch (error) {
      logger.error(`❌ Failed to get account ${address}:`, error);
      throw error;
    }
  }

  async updateAccountBalance(address: string, balance: string, balanceXRP: string): Promise<void> {
    try {
      await this.prisma.account.upsert({
        where: { address },
        update: {
          balance,
          balanceXRP,
          lastSyncAt: new Date(),
        },
        create: {
          address,
          balance,
          balanceXRP,
          lastSyncAt: new Date(),
        },
      });
      
      logger.debug(`💰 Updated balance for ${address}: ${balanceXRP} XRP`);
    } catch (error) {
      logger.error(`❌ Failed to update balance for ${address}:`, error);
      throw error;
    }
  }

  // Alias for createAccount to match server usage
  async saveAccount(data: {
    address: string;
    network?: string;
    publicKey?: string;
    privateKey?: string;
    seed?: string;
    balance?: string;
    balanceXRP?: string;
    isOwned?: boolean;
    nickname?: string;
    description?: string;
    metadata?: any;
  }) {
    const accountData = {
      address: data.address,
      network: data.network || 'testnet',
      publicKey: data.publicKey,
      privateKey: data.privateKey,
      seed: data.seed,
      balance: data.balance,
      balanceXRP: data.balanceXRP,
      isOwned: data.isOwned || false,
      nickname: data.nickname,
      description: data.description,
    };

    // If metadata is provided, try to extract useful fields
    if (data.metadata) {
      if (data.metadata.publicKey && !accountData.publicKey) {
        accountData.publicKey = data.metadata.publicKey;
      }
      if (data.metadata.privateKey && !accountData.privateKey) {
        accountData.privateKey = data.metadata.privateKey;
      }
      if (data.metadata.seed && !accountData.seed) {
        accountData.seed = data.metadata.seed;
      }
      if (data.metadata.balanceDrops && !accountData.balance) {
        accountData.balance = data.metadata.balanceDrops;
      }
      if (data.metadata.balanceXRP && !accountData.balanceXRP) {
        accountData.balanceXRP = data.metadata.balanceXRP;
      }
      // Store metadata as JSON in tags field for now
      if (Object.keys(data.metadata).length > 0) {
        accountData.description = accountData.description || JSON.stringify(data.metadata);
      }
    }

    return this.createAccount(accountData);
  }

  async updateAccount(address: string, updates: {
    address?: string;
    balance?: string;
    balanceXRP?: string;
    seed?: string;
    nickname?: string;
    description?: string;
    tags?: string;
    metadata?: any;
  }) {
    try {
      const updateData: any = {};
      
      if (updates.address !== undefined) updateData.address = updates.address;
      if (updates.balance !== undefined) updateData.balance = updates.balance;
      if (updates.balanceXRP !== undefined) updateData.balanceXRP = updates.balanceXRP;
      if (updates.seed !== undefined) updateData.seed = updates.seed;
      if (updates.nickname !== undefined) updateData.nickname = updates.nickname;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      
      // Handle metadata by storing in tags field as JSON
      if (updates.metadata) {
        updateData.tags = JSON.stringify(updates.metadata);
      }

      const account = await this.prisma.account.update({
        where: { address },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });
      
      logger.info(`📝 Updated account: ${updates.address || address}`);
      return account;
    } catch (error) {
      logger.error(`❌ Failed to update account ${address}:`, error);
      throw error;
    }
  }

  async getAllAccounts(limit?: number) {
    try {
      return await this.prisma.account.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        include: {
          nftsOwned: true,
          nftsIssued: true,
        },
      });
    } catch (error) {
      logger.error('❌ Failed to get all accounts:', error);
      throw error;
    }
  }

  // NFT management
  async createNFT(data: {
    nftTokenID: string;
    issuerAddress: string;
    ownerAddress: string;
    flags?: number;
    transferFee?: number;
    nftTaxon?: number;
    nftSerial?: number;
    uri?: string;
    name?: string;
    description?: string;
    imageUrl?: string;
    attributes?: string;
    txHash?: string;
    ledgerIndex?: number;
    fee?: string;
    category?: string;
    rarity?: string;
    mintedAt?: Date;
  }) {
    try {
      // Ensure accounts exist
      await this.prisma.account.upsert({
        where: { address: data.issuerAddress },
        update: { lastSyncAt: new Date() },
        create: { address: data.issuerAddress },
      });

      await this.prisma.account.upsert({
        where: { address: data.ownerAddress },
        update: { lastSyncAt: new Date() },
        create: { address: data.ownerAddress },
      });

      const nft = await this.prisma.nFT.create({
        data: {
          nftTokenID: data.nftTokenID,
          issuerAddress: data.issuerAddress,
          ownerAddress: data.ownerAddress,
          flags: data.flags,
          transferFee: data.transferFee,
          nftTaxon: data.nftTaxon,
          nftSerial: data.nftSerial,
          uri: data.uri,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          attributes: data.attributes,
          txHash: data.txHash,
          ledgerIndex: data.ledgerIndex,
          fee: data.fee,
          category: data.category,
          rarity: data.rarity,
          mintedAt: data.mintedAt || new Date(),
          lastSyncAt: new Date(),
        },
      });

      logger.info(`🎨 Created NFT record: ${data.nftTokenID}`);
      return nft;
    } catch (error) {
      logger.error('❌ Failed to create NFT:', error);
      throw error;
    }
  }

  async getNFT(nftTokenID: string) {
    try {
      return await this.prisma.nFT.findUnique({
        where: { nftTokenID },
        include: {
          issuer: true,
          owner: true,
        },
      });
    } catch (error) {
      logger.error(`❌ Failed to get NFT ${nftTokenID}:`, error);
      throw error;
    }
  }

  async getNFTsByOwner(ownerAddress: string, limit: number = 20, offset: number = 0) {
    try {
      return await this.prisma.nFT.findMany({
        where: { 
          ownerAddress,
          isBurned: false,
        },
        include: {
          issuer: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      logger.error(`❌ Failed to get NFTs for owner ${ownerAddress}:`, error);
      throw error;
    }
  }

  async getNFTsByIssuer(issuerAddress: string, limit: number = 20, offset: number = 0) {
    try {
      return await this.prisma.nFT.findMany({
        where: { 
          issuerAddress,
          isBurned: false,
        },
        include: {
          owner: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    } catch (error) {
      logger.error(`❌ Failed to get NFTs for issuer ${issuerAddress}:`, error);
      throw error;
    }
  }

  async updateNFTOwner(nftTokenID: string, newOwnerAddress: string): Promise<void> {
    try {
      // Ensure new owner account exists
      await this.prisma.account.upsert({
        where: { address: newOwnerAddress },
        update: { lastSyncAt: new Date() },
        create: { address: newOwnerAddress },
      });

      await this.prisma.nFT.update({
        where: { nftTokenID },
        data: {
          ownerAddress: newOwnerAddress,
          lastSyncAt: new Date(),
        },
      });

      logger.info(`🔄 Updated NFT ${nftTokenID} owner to ${newOwnerAddress}`);
    } catch (error) {
      logger.error(`❌ Failed to update NFT owner:`, error);
      throw error;
    }
  }

  async updateNFTStatus(nftTokenID: string, updates: {
    isWrapped?: boolean;
    songbirdTokenId?: string;
    wrapTransactionHash?: string;
    unwrapTransactionHash?: string;
    wrappedAt?: Date;
    unwrappedAt?: Date;
  }): Promise<void> {
    try {
      await this.prisma.nFT.update({
        where: { nftTokenID },
        data: {
          ...updates,
          lastSyncAt: new Date(),
        },
      });

      logger.info(`🔄 Updated NFT ${nftTokenID} wrap status`);
    } catch (error) {
      logger.error(`❌ Failed to update NFT status:`, error);
      throw error;
    }
  }

  async burnNFT(nftTokenID: string): Promise<void> {
    try {
      await this.prisma.nFT.update({
        where: { nftTokenID },
        data: {
          isBurned: true,
          lastSyncAt: new Date(),
        },
      });

      logger.info(`🔥 Marked NFT ${nftTokenID} as burned`);
    } catch (error) {
      logger.error(`❌ Failed to burn NFT:`, error);
      throw error;
    }
  }

  // Transaction logging
  async logTransaction(data: {
    txHash: string;
    txType: string;
    account: string;
    fee: string;
    sequence?: number;
    ledgerIndex?: number;
    nftTokenID?: string;
    amount?: string;
    destination?: string;
    validated?: boolean;
    successful?: boolean;
    errorCode?: string;
    errorMessage?: string;
    memo?: string;
    metadata?: string;
    submittedAt?: Date;
    validatedAt?: Date;
  }) {
    try {
      const transaction = await this.prisma.transaction.create({
        data: {
          txHash: data.txHash,
          txType: data.txType,
          account: data.account,
          fee: data.fee,
          sequence: data.sequence,
          ledgerIndex: data.ledgerIndex,
          nftTokenID: data.nftTokenID,
          amount: data.amount,
          destination: data.destination,
          validated: data.validated || false,
          successful: data.successful || false,
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
          memo: data.memo,
          metadata: data.metadata,
          submittedAt: data.submittedAt,
          validatedAt: data.validatedAt,
        },
      });

      logger.info(`📋 Logged transaction: ${data.txHash}`);
      return transaction;
    } catch (error) {
      logger.error('❌ Failed to log transaction:', error);
      throw error;
    }
  }

  async getTransaction(txHash: string) {
    try {
      return await this.prisma.transaction.findUnique({
        where: { txHash },
      });
    } catch (error) {
      logger.error(`❌ Failed to get transaction ${txHash}:`, error);
      throw error;
    }
  }

  // Statistics and analytics
  async getNFTStats(): Promise<{
    totalNFTs: number;
    activeNFTs: number;
    burnedNFTs: number;
    totalAccounts: number;
    recentMints: number;
  }> {
    try {
      const [totalNFTs, activeNFTs, burnedNFTs, totalAccounts, recentMints] = await Promise.all([
        this.prisma.nFT.count(),
        this.prisma.nFT.count({ where: { isBurned: false } }),
        this.prisma.nFT.count({ where: { isBurned: true } }),
        this.prisma.account.count(),
        this.prisma.nFT.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
      ]);

      return {
        totalNFTs,
        activeNFTs,
        burnedNFTs,
        totalAccounts,
        recentMints,
      };
    } catch (error) {
      logger.error('❌ Failed to get NFT stats:', error);
      throw error;
    }
  }

  // Database health check
  async healthCheck(): Promise<{ connected: boolean; responseTime: number }> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      return { connected: true, responseTime };
    } catch (error) {
      logger.error('❌ Database health check failed:', error);
      return { connected: false, responseTime: Date.now() - startTime };
    }
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
