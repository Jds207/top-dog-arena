"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const nft_controller_1 = require("../controllers/nft.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const nft_validator_1 = require("../validators/nft.validator");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/nft/create
 * @desc    Create a single NFT on XRPL
 * @access  Public (rate limited)
 */
router.post('/create', rateLimit_middleware_1.nftCreationLimiter, (0, validation_middleware_1.validate)(nft_validator_1.CreateNFTSchema), (0, error_middleware_1.asyncHandler)(nft_controller_1.createNFT));
/**
 * @route   POST /api/nft/batch-create
 * @desc    Create multiple NFTs in a batch
 * @access  Public (rate limited)
 */
router.post('/batch-create', rateLimit_middleware_1.batchLimiter, (0, validation_middleware_1.validate)(nft_validator_1.BatchCreateNFTsSchema), (0, error_middleware_1.asyncHandler)(nft_controller_1.batchCreateNFTs));
/**
 * @route   GET /api/nft/:nftId
 * @desc    Get NFT details by ID
 * @access  Public (rate limited)
 */
router.get('/:nftId', rateLimit_middleware_1.readLimiter, (0, validation_middleware_1.validateParams)(nft_validator_1.GetNFTByIdSchema), (0, error_middleware_1.asyncHandler)(nft_controller_1.getNFTById));
/**
 * @route   GET /api/nft/account/:account
 * @desc    Get all NFTs owned by an account
 * @access  Public (rate limited)
 */
router.get('/account/:account', rateLimit_middleware_1.readLimiter, (0, validation_middleware_1.validateParams)(nft_validator_1.GetAccountNFTsSchema), (0, validation_middleware_1.validateQuery)(nft_validator_1.PaginationSchema), (0, error_middleware_1.asyncHandler)(nft_controller_1.getAccountNFTs));
/**
 * @route   GET /api/nft/wallet/info
 * @desc    Get wallet and network information
 * @access  Public (rate limited)
 */
router.get('/wallet/info', rateLimit_middleware_1.readLimiter, (0, error_middleware_1.asyncHandler)(nft_controller_1.getWalletInfo));
exports.default = router;
//# sourceMappingURL=nft.routes.js.map