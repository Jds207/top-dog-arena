import { Router } from 'express';
import {
  createNFT,
  getNFTById,
  getAccountNFTs,
  getWalletInfo,
  batchCreateNFTs
} from '../controllers/nft.controller';
import { validate, validateParams, validateQuery } from '../middleware/validation.middleware';
import { 
  CreateNFTSchema, 
  BatchCreateNFTsSchema,
  GetNFTByIdSchema,
  GetAccountNFTsSchema,
  PaginationSchema
} from '../validators/nft.validator';
import { 
  nftCreationLimiter, 
  batchLimiter, 
  readLimiter 
} from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @route   POST /api/nft/create
 * @desc    Create a single NFT on XRPL
 * @access  Public (rate limited)
 */
router.post(
  '/create',
  nftCreationLimiter,
  validate(CreateNFTSchema),
  asyncHandler(createNFT)
);

/**
 * @route   POST /api/nft/batch-create
 * @desc    Create multiple NFTs in a batch
 * @access  Public (rate limited)
 */
router.post(
  '/batch-create',
  batchLimiter,
  validate(BatchCreateNFTsSchema),
  asyncHandler(batchCreateNFTs)
);

/**
 * @route   GET /api/nft/:nftId
 * @desc    Get NFT details by ID
 * @access  Public (rate limited)
 */
router.get(
  '/:nftId',
  readLimiter,
  validateParams(GetNFTByIdSchema),
  asyncHandler(getNFTById)
);

/**
 * @route   GET /api/nft/account/:account
 * @desc    Get all NFTs owned by an account
 * @access  Public (rate limited)
 */
router.get(
  '/account/:account',
  readLimiter,
  validateParams(GetAccountNFTsSchema),
  validateQuery(PaginationSchema),
  asyncHandler(getAccountNFTs)
);

/**
 * @route   GET /api/nft/wallet/info
 * @desc    Get wallet and network information
 * @access  Public (rate limited)
 */
router.get(
  '/wallet/info',
  readLimiter,
  asyncHandler(getWalletInfo)
);

export default router;
