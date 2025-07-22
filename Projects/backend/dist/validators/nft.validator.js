"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuccessResponseSchema = exports.ErrorResponseSchema = exports.PaginationSchema = exports.GetAccountNFTsSchema = exports.GetNFTByIdSchema = exports.BatchCreateNFTsSchema = exports.CreateNFTSchema = exports.NFTMetadataSchema = void 0;
const zod_1 = require("zod");
// Base NFT metadata schema
exports.NFTMetadataSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    image: zod_1.z.string().url('Image must be a valid URL'),
    attributes: zod_1.z.array(zod_1.z.object({
        trait_type: zod_1.z.string().min(1, 'Trait type is required'),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()], {
            errorMap: () => ({ message: 'Attribute value must be string or number' })
        })
    })).optional().default([]),
    external_url: zod_1.z.string().url('External URL must be valid').optional(),
    animation_url: zod_1.z.string().url('Animation URL must be valid').optional()
});
// Create NFT request schema
exports.CreateNFTSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(1000, 'Description too long'),
    image: zod_1.z.string().url('Image must be a valid URL'),
    attributes: zod_1.z.array(zod_1.z.object({
        trait_type: zod_1.z.string().min(1, 'Trait type is required'),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
    })).optional().default([]),
    external_url: zod_1.z.string().url('External URL must be valid').optional(),
    animation_url: zod_1.z.string().url('Animation URL must be valid').optional(),
    transferFee: zod_1.z.number()
        .min(0, 'Transfer fee cannot be negative')
        .max(50000, 'Transfer fee cannot exceed 50000 (50%)')
        .optional(),
    recipient: zod_1.z.string()
        .regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, 'Invalid XRPL address format')
        .optional(),
    flags: zod_1.z.number().optional()
});
// Batch create NFTs schema
exports.BatchCreateNFTsSchema = zod_1.z.object({
    nfts: zod_1.z.array(exports.CreateNFTSchema)
        .min(1, 'At least one NFT is required')
        .max(10, 'Maximum 10 NFTs per batch')
});
// Get NFT by ID params schema
exports.GetNFTByIdSchema = zod_1.z.object({
    nftId: zod_1.z.string()
        .length(64, 'NFT ID must be 64 characters long')
        .regex(/^[0-9A-Fa-f]+$/, 'NFT ID must be hexadecimal')
});
// Get account NFTs params schema
exports.GetAccountNFTsSchema = zod_1.z.object({
    account: zod_1.z.string()
        .regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, 'Invalid XRPL address format')
});
// Query parameters for pagination
exports.PaginationSchema = zod_1.z.object({
    limit: zod_1.z.string()
        .regex(/^\d+$/, 'Limit must be a number')
        .transform(Number)
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .optional(),
    marker: zod_1.z.string().optional()
});
// Error response schema (for documentation)
exports.ErrorResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(false),
    error: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        message: zod_1.z.string()
    })).optional()
});
// Success response schema (for documentation)
exports.SuccessResponseSchema = zod_1.z.object({
    success: zod_1.z.literal(true),
    data: zod_1.z.any(),
    message: zod_1.z.string()
});
//# sourceMappingURL=nft.validator.js.map