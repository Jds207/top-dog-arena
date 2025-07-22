"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = exports.DatabaseService = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
class DatabaseService {
    prisma;
    constructor() {
        this.prisma = new client_1.PrismaClient({
            log: ['error', 'warn'],
        });
    }
    async connect() {
        try {
            await this.prisma.$connect();
            logger_1.logger.info('✅ Database connected successfully');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }
    async disconnect() {
        try {
            await this.prisma.$disconnect();
            logger_1.logger.info('🔌 Database disconnected');
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to disconnect from database:', error);
        }
    }
    // Account management
    async createAccount(data) {
        try {
            const account = await this.prisma.account.create({
                data: {
                    address: data.address,
                    network: data.network || 'testnet',
                    publicKey: data.publicKey,
                    isOwned: data.isOwned || false,
                    nickname: data.nickname,
                    description: data.description,
                },
            });
            logger_1.logger.info(`📝 Created account record: ${data.address}`);
            return account;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to create account:', error);
            throw error;
        }
    }
    async getAccount(address) {
        try {
            return await this.prisma.account.findUnique({
                where: { address },
                include: {
                    nftsOwned: true,
                    nftsIssued: true,
                },
            });
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get account ${address}:`, error);
            throw error;
        }
    }
    async updateAccountBalance(address, balance, balanceXRP) {
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
            logger_1.logger.debug(`💰 Updated balance for ${address}: ${balanceXRP} XRP`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to update balance for ${address}:`, error);
            throw error;
        }
    }
    // NFT management
    async createNFT(data) {
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
            logger_1.logger.info(`🎨 Created NFT record: ${data.nftTokenID}`);
            return nft;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to create NFT:', error);
            throw error;
        }
    }
    async getNFT(nftTokenID) {
        try {
            return await this.prisma.nFT.findUnique({
                where: { nftTokenID },
                include: {
                    issuer: true,
                    owner: true,
                },
            });
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get NFT ${nftTokenID}:`, error);
            throw error;
        }
    }
    async getNFTsByOwner(ownerAddress, limit = 20, offset = 0) {
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
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get NFTs for owner ${ownerAddress}:`, error);
            throw error;
        }
    }
    async getNFTsByIssuer(issuerAddress, limit = 20, offset = 0) {
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
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get NFTs for issuer ${issuerAddress}:`, error);
            throw error;
        }
    }
    async updateNFTOwner(nftTokenID, newOwnerAddress) {
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
            logger_1.logger.info(`🔄 Updated NFT ${nftTokenID} owner to ${newOwnerAddress}`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to update NFT owner:`, error);
            throw error;
        }
    }
    async burnNFT(nftTokenID) {
        try {
            await this.prisma.nFT.update({
                where: { nftTokenID },
                data: {
                    isBurned: true,
                    lastSyncAt: new Date(),
                },
            });
            logger_1.logger.info(`🔥 Marked NFT ${nftTokenID} as burned`);
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to burn NFT:`, error);
            throw error;
        }
    }
    // Transaction logging
    async logTransaction(data) {
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
            logger_1.logger.info(`📋 Logged transaction: ${data.txHash}`);
            return transaction;
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to log transaction:', error);
            throw error;
        }
    }
    async getTransaction(txHash) {
        try {
            return await this.prisma.transaction.findUnique({
                where: { txHash },
            });
        }
        catch (error) {
            logger_1.logger.error(`❌ Failed to get transaction ${txHash}:`, error);
            throw error;
        }
    }
    // Statistics and analytics
    async getNFTStats() {
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
        }
        catch (error) {
            logger_1.logger.error('❌ Failed to get NFT stats:', error);
            throw error;
        }
    }
    // Database health check
    async healthCheck() {
        const startTime = Date.now();
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            const responseTime = Date.now() - startTime;
            return { connected: true, responseTime };
        }
        catch (error) {
            logger_1.logger.error('❌ Database health check failed:', error);
            return { connected: false, responseTime: Date.now() - startTime };
        }
    }
}
exports.DatabaseService = DatabaseService;
// Singleton instance
exports.databaseService = new DatabaseService();
//# sourceMappingURL=database.service.js.map