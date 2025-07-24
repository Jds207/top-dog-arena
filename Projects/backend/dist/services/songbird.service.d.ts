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
export declare class SongbirdService {
    private provider;
    private wallet;
    private contract;
    private connected;
    private readonly contractABI;
    constructor();
    private initializeConnection;
    getConnectionStatus(): Promise<{
        connected: boolean;
        network?: string;
        walletAddress?: string;
        contractAddress?: string;
        balance?: string;
    }>;
    wrapXRPLNFT(request: WrapNFTRequest): Promise<{
        success: boolean;
        songbirdTokenId?: string;
        transactionHash?: string;
        gasUsed?: string;
        error?: string;
    }>;
    unwrapNFT(songbirdTokenId: string): Promise<{
        success: boolean;
        xrplNftId?: string;
        transactionHash?: string;
        gasUsed?: string;
        error?: string;
    }>;
    getWrappedNFTInfo(songbirdTokenId: string): Promise<{
        success: boolean;
        info?: {
            xrplNftId: string;
            isWrapped: boolean;
            owner: string;
            tokenURI: string;
            metadata?: any;
        };
        error?: string;
    }>;
    getWalletNFTs(walletAddress: string): Promise<{
        success: boolean;
        nfts?: Array<{
            tokenId: string;
            xrplNftId: string;
            isWrapped: boolean;
            tokenURI: string;
            metadata?: any;
        }>;
        error?: string;
    }>;
    private createMetadataURI;
    getGasEstimate(operation: 'wrap' | 'unwrap'): Promise<{
        gasLimit: string;
        gasPrice: string;
        estimatedCost: string;
    }>;
}
export declare const songbirdService: SongbirdService;
//# sourceMappingURL=songbird.service.d.ts.map