export interface XRPLConfig {
    serverUrl: string;
    walletSeed: string;
    network: 'mainnet' | 'testnet' | 'devnet';
}
export interface NFTMetadata {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
    external_url?: string;
    animation_url?: string;
}
export interface MintNFTRequest {
    metadata: NFTMetadata;
    transferFee?: number;
    flags?: number;
    recipient?: string;
}
export interface MintNFTResult {
    success: boolean;
    txHash?: string;
    nftId?: string;
    error?: string;
    fee?: string;
}
declare class XRPLService {
    private client;
    private wallet;
    private config;
    constructor();
    /**
     * Initialize XRPL client and wallet
     */
    initialize(): Promise<void>;
    /**
     * Check wallet balance and reserve requirements
     */
    checkWalletBalance(): Promise<{
        balance: string;
        available: string;
    }>;
    /**
     * Get balance of any XRPL address in XRP (not drops)
     */
    getBalance(address: string): Promise<string>;
    /**
     * Send XRP from one address to another
     */
    sendXRP(fromAddress: string, toAddress: string, amount: string): Promise<{
        success: boolean;
        transactionHash?: string;
        error?: string;
    }>;
    /**
     * Get account reserve requirements
     */
    getAccountReserve(): Promise<number>;
    /**
     * Mint an NFT on XRPL
     */
    mintNFT(request: MintNFTRequest): Promise<MintNFTResult>;
    /**
     * Get NFT details by ID
     */
    getNFTDetails(nftId: string): Promise<any>;
    /**
     * Get all NFTs owned by an account
     */
    getAccountNFTs(account: string): Promise<any[]>;
    /**
     * Create a new XRPL wallet
     */
    createWallet(): Promise<{
        address: string;
        seed: string;
        publicKey: string;
        privateKey: string;
    }>;
    /**
     * Fund a wallet from testnet faucet (testnet only)
     */
    fundWallet(address: string): Promise<{
        success: boolean;
        balance?: string;
        error?: string;
        fundedAddress?: string;
        fundedSeed?: string;
    }>;
    /**
     * Check if an address is a valid XRPL address
     */
    isValidXRPLAddress(address: string): boolean;
    /**
     * Disconnect from XRPL
     */
    disconnect(): Promise<void>;
    /**
     * Utility: Convert string to hex
     */
    private convertStringToHex;
    /**
     * Utility: Extract NFT ID from transaction metadata
     */
    private extractNFTIdFromMeta;
    /**
     * Get current network info
     */
    getNetworkInfo(): {
        network: string;
        serverUrl: string;
        walletAddress: string | null;
    };
}
export declare const xrplService: XRPLService;
export declare function initializeXRPL(): Promise<void>;
export default xrplService;
//# sourceMappingURL=xrpl.service.d.ts.map