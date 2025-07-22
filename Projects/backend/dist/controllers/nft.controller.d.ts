import { Request, Response } from 'express';
export interface CreateNFTRequest extends Request {
    body: {
        name: string;
        description: string;
        image: string;
        attributes: Array<{
            trait_type: string;
            value: string | number;
        }>;
        external_url?: string;
        animation_url?: string;
        transferFee?: number;
        recipient?: string;
        flags?: number;
    };
}
export interface NFTResponse {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}
/**
 * Create/Mint a new NFT on XRPL
 */
export declare const createNFT: (req: CreateNFTRequest, res: Response) => Promise<void>;
/**
 * Get NFT details by ID
 */
export declare const getNFTById: (req: Request, res: Response) => Promise<void>;
/**
 * Get all NFTs owned by an account
 */
export declare const getAccountNFTs: (req: Request, res: Response) => Promise<void>;
/**
 * Get wallet balance and network info
 */
export declare const getWalletInfo: (req: Request, res: Response) => Promise<void>;
/**
 * Batch mint multiple NFTs
 */
export declare const batchCreateNFTs: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=nft.controller.d.ts.map