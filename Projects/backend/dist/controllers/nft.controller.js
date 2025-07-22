"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchCreateNFTs = exports.getWalletInfo = exports.getAccountNFTs = exports.getNFTById = exports.createNFT = void 0;
const xrpl_service_1 = require("../services/xrpl.service");
const logger_1 = require("../utils/logger");
/**
 * Create/Mint a new NFT on XRPL
 */
const createNFT = async (req, res) => {
    try {
        const { name, description, image, attributes, external_url, animation_url, transferFee, recipient, flags } = req.body;
        logger_1.logger.info(`📝 Creating NFT: ${name}`);
        // Prepare metadata
        const metadata = {
            name,
            description,
            image,
            attributes,
            external_url,
            animation_url
        };
        // Prepare mint request
        const mintRequest = {
            metadata,
            transferFee,
            recipient,
            flags
        };
        // Mint the NFT
        const result = await xrpl_service_1.xrplService.mintNFT(mintRequest);
        if (result.success) {
            const response = {
                success: true,
                data: {
                    nftId: result.nftId,
                    txHash: result.txHash,
                    fee: result.fee,
                    metadata
                },
                message: 'NFT created successfully'
            };
            logger_1.logger.info(`✅ NFT created: ${result.nftId}`);
            res.status(201).json(response);
        }
        else {
            const response = {
                success: false,
                error: result.error,
                message: 'Failed to create NFT'
            };
            logger_1.logger.error(`❌ NFT creation failed: ${result.error}`);
            res.status(400).json(response);
        }
    }
    catch (error) {
        logger_1.logger.error('❌ Error in createNFT controller:', error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: 'Failed to create NFT'
        };
        res.status(500).json(response);
    }
};
exports.createNFT = createNFT;
/**
 * Get NFT details by ID
 */
const getNFTById = async (req, res) => {
    try {
        const { nftId } = req.params;
        if (!nftId) {
            const response = {
                success: false,
                error: 'NFT ID is required',
                message: 'Invalid request'
            };
            res.status(400).json(response);
            return;
        }
        logger_1.logger.info(`🔍 Fetching NFT details: ${nftId}`);
        const nftDetails = await xrpl_service_1.xrplService.getNFTDetails(nftId);
        const response = {
            success: true,
            data: nftDetails,
            message: 'NFT details retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.logger.error(`❌ Error fetching NFT ${req.params.nftId}:`, error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: 'Failed to fetch NFT details'
        };
        res.status(500).json(response);
    }
};
exports.getNFTById = getNFTById;
/**
 * Get all NFTs owned by an account
 */
const getAccountNFTs = async (req, res) => {
    try {
        const { account } = req.params;
        if (!account) {
            const response = {
                success: false,
                error: 'Account address is required',
                message: 'Invalid request'
            };
            res.status(400).json(response);
            return;
        }
        logger_1.logger.info(`🔍 Fetching NFTs for account: ${account}`);
        const accountNFTs = await xrpl_service_1.xrplService.getAccountNFTs(account);
        const response = {
            success: true,
            data: {
                account,
                nfts: accountNFTs,
                count: accountNFTs.length
            },
            message: 'Account NFTs retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.logger.error(`❌ Error fetching NFTs for account ${req.params.account}:`, error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: 'Failed to fetch account NFTs'
        };
        res.status(500).json(response);
    }
};
exports.getAccountNFTs = getAccountNFTs;
/**
 * Get wallet balance and network info
 */
const getWalletInfo = async (req, res) => {
    try {
        logger_1.logger.info('🔍 Fetching wallet info');
        const networkInfo = xrpl_service_1.xrplService.getNetworkInfo();
        let balanceInfo = null;
        if (networkInfo.walletAddress) {
            try {
                balanceInfo = await xrpl_service_1.xrplService.checkWalletBalance();
            }
            catch (error) {
                logger_1.logger.warn('Could not fetch balance info:', error);
            }
        }
        const response = {
            success: true,
            data: {
                network: networkInfo,
                balance: balanceInfo
            },
            message: 'Wallet info retrieved successfully'
        };
        res.status(200).json(response);
    }
    catch (error) {
        logger_1.logger.error('❌ Error fetching wallet info:', error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: 'Failed to fetch wallet info'
        };
        res.status(500).json(response);
    }
};
exports.getWalletInfo = getWalletInfo;
/**
 * Batch mint multiple NFTs
 */
const batchCreateNFTs = async (req, res) => {
    try {
        const { nfts } = req.body;
        if (!Array.isArray(nfts) || nfts.length === 0) {
            const response = {
                success: false,
                error: 'Array of NFTs is required',
                message: 'Invalid request'
            };
            res.status(400).json(response);
            return;
        }
        if (nfts.length > 10) { // Limit batch size
            const response = {
                success: false,
                error: 'Maximum batch size is 10 NFTs',
                message: 'Invalid request'
            };
            res.status(400).json(response);
            return;
        }
        logger_1.logger.info(`📝 Batch creating ${nfts.length} NFTs`);
        const results = [];
        const errors = [];
        for (let i = 0; i < nfts.length; i++) {
            const nftData = nfts[i];
            try {
                const metadata = {
                    name: nftData.name,
                    description: nftData.description,
                    image: nftData.image,
                    attributes: nftData.attributes,
                    external_url: nftData.external_url,
                    animation_url: nftData.animation_url
                };
                const mintRequest = {
                    metadata,
                    transferFee: nftData.transferFee,
                    recipient: nftData.recipient,
                    flags: nftData.flags
                };
                const result = await xrpl_service_1.xrplService.mintNFT(mintRequest);
                if (result.success) {
                    results.push({
                        index: i,
                        nftId: result.nftId,
                        txHash: result.txHash,
                        fee: result.fee,
                        metadata
                    });
                }
                else {
                    errors.push({
                        index: i,
                        error: result.error,
                        nftData
                    });
                }
                // Small delay between mints to avoid overwhelming the network
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            catch (error) {
                errors.push({
                    index: i,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    nftData
                });
            }
        }
        const response = {
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
    }
    catch (error) {
        logger_1.logger.error('❌ Error in batch NFT creation:', error);
        const response = {
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
            message: 'Failed to create NFTs'
        };
        res.status(500).json(response);
    }
};
exports.batchCreateNFTs = batchCreateNFTs;
//# sourceMappingURL=nft.controller.js.map