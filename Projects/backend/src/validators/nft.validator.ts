import { z } from 'zod';

// Base NFT metadata schema
export const NFTMetadataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  image: z.string().url('Image must be a valid URL'),
  attributes: z.array(
    z.object({
      trait_type: z.string().min(1, 'Trait type is required'),
      value: z.union([z.string(), z.number()], {
        errorMap: () => ({ message: 'Attribute value must be string or number' })
      })
    })
  ).optional().default([]),
  external_url: z.string().url('External URL must be valid').optional(),
  animation_url: z.string().url('Animation URL must be valid').optional()
});

// Create NFT request schema
export const CreateNFTSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  image: z.string().url('Image must be a valid URL'),
  attributes: z.array(
    z.object({
      trait_type: z.string().min(1, 'Trait type is required'),
      value: z.union([z.string(), z.number()])
    })
  ).optional().default([]),
  external_url: z.string().url('External URL must be valid').optional(),
  animation_url: z.string().url('Animation URL must be valid').optional(),
  transferFee: z.number()
    .min(0, 'Transfer fee cannot be negative')
    .max(50000, 'Transfer fee cannot exceed 50000 (50%)')
    .optional(),
  recipient: z.string()
    .regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, 'Invalid XRPL address format')
    .optional(),
  flags: z.number().optional()
});

// Batch create NFTs schema
export const BatchCreateNFTsSchema = z.object({
  nfts: z.array(CreateNFTSchema)
    .min(1, 'At least one NFT is required')
    .max(10, 'Maximum 10 NFTs per batch')
});

// Get NFT by ID params schema
export const GetNFTByIdSchema = z.object({
  nftId: z.string()
    .length(64, 'NFT ID must be 64 characters long')
    .regex(/^[0-9A-Fa-f]+$/, 'NFT ID must be hexadecimal')
});

// Get account NFTs params schema
export const GetAccountNFTsSchema = z.object({
  account: z.string()
    .regex(/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/, 'Invalid XRPL address format')
});

// Query parameters for pagination
export const PaginationSchema = z.object({
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
    .optional(),
  marker: z.string().optional()
});

// Error response schema (for documentation)
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
});

// Success response schema (for documentation)
export const SuccessResponseSchema = z.object({
  success: z.literal(true),
  data: z.any(),
  message: z.string()
});

// Type exports for TypeScript
export type CreateNFTRequest = z.infer<typeof CreateNFTSchema>;
export type BatchCreateNFTsRequest = z.infer<typeof BatchCreateNFTsSchema>;
export type GetNFTByIdParams = z.infer<typeof GetNFTByIdSchema>;
export type GetAccountNFTsParams = z.infer<typeof GetAccountNFTsSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
