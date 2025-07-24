import { NFTTraitValue } from '../base-types';

/**
 * NFT attribute interface
 */
export interface NFTAttribute {
  trait_type: string;
  value: NFTTraitValue;
}

/**
 * NFT metadata interface
 */
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
}

/**
 * NFT creation request
 */
export interface CreateNFTRequest {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
  external_url?: string;
  animation_url?: string;
  transferFee?: number; // 0-50000 (in 1/100,000th units)
  recipient?: string; // XRPL address pattern
  flags?: number; // NFT flags (8 = transferable)
}

/**
 * Batch NFT creation request
 */
export interface BatchCreateNFTRequest {
  nfts: CreateNFTRequest[];
}

/**
 * NFT created response data
 */
export interface NFTCreatedData {
  nftId: string;
  txHash: string;
  fee: string;
  metadata: NFTMetadata;
}

/**
 * Batch NFT creation result
 */
export interface BatchNFTResult {
  successful: BatchNFTSuccessItem[];
  failed: BatchNFTFailedItem[];
  summary: BatchNFTSummary;
}

export interface BatchNFTSuccessItem {
  index: number;
  nftId: string;
  txHash: string;
  fee: string;
  metadata: NFTMetadata;
}

export interface BatchNFTFailedItem {
  index: number;
  error: string;
  nftData: CreateNFTRequest;
}

export interface BatchNFTSummary {
  total: number;
  successful: number;
  failed: number;
}

/**
 * XRPL NFT details (from ledger)
 */
export interface XRPLNFTDetails {
  nft_id: string;
  ledger_index: number;
  owner: string;
  is_burned: boolean;
  flags: number;
  transfer_fee: number;
  issuer: string;
  nft_taxon: number;
  nft_serial: number;
  uri: string; // Hex-encoded metadata URI
}

/**
 * Account NFT from XRPL ledger
 */
export interface AccountNFT {
  Flags: number;
  Issuer: string;
  NFTokenID: string;
  NFTokenTaxon: number;
  TransferFee: number;
  URI: string;
  nft_serial: number;
}

/**
 * Account NFTs response data
 */
export interface AccountNFTsData {
  account: string;
  nfts: AccountNFT[];
  count: number;
}

/**
 * NFT statistics data
 */
export interface NFTStatsData {
  totalNFTs: number;
  totalAccounts: number;
  recentMints: number; // Last 24 hours
  totalTransactions: number;
}

/**
 * Display NFT (transformed for UI)
 */
export class DisplayNFT {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public tokenId: string,
    public image?: string,
    public attributes: NFTAttribute[] = []
  ) {}

  /**
   * Create DisplayNFT from AccountNFT
   */
  static fromAccountNFT(nft: AccountNFT): DisplayNFT {
    return new DisplayNFT(
      nft.NFTokenID,
      `NFT #${nft.nft_serial}`,
      `Baseball Card NFT from ${nft.Issuer.slice(0, 10)}...`,
      nft.NFTokenID,
      nft.URI ? DisplayNFT.decodeHexURI(nft.URI) : undefined,
      [
        { trait_type: 'Serial', value: nft.nft_serial.toString() },
        { trait_type: 'Taxon', value: nft.NFTokenTaxon.toString() },
        { trait_type: 'Transfer Fee', value: `${nft.TransferFee / 1000}%` },
        { trait_type: 'Flags', value: nft.Flags.toString() }
      ]
    );
  }

  /**
   * Decode hex-encoded URI
   */
  private static decodeHexURI(hexString: string): string {
    try {
      const cleanHex = hexString.replace(/^0x/, '');
      let result = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        result += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
      return result;
    } catch (error) {
      console.warn('Failed to decode hex URI:', hexString, error);
      return '';
    }
  }
}
