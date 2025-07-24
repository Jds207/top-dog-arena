# Top Dog Arena NFT API Documentation

**Version:** 1.1.0  
**Last Updated:** July 23, 2025 - Updated wallet funding endpoint with enhanced response structure  
**Base URL:** http://localhost:3000/api  
**Production URL:** https://api.topdogarena.com/api  

## Overview

RESTful API for creating and managing NFTs on the XRPL (XRP Ledger) for Top Dog Arena baseball card marketplace.

### Features
- Create single and batch NFTs on XRPL
- Query NFT details and ownership
- XRPL wallet management with testnet faucet integration
- Cross-chain NFT wrapping between XRPL and Songbird network
- Health monitoring endpoints
- Rate limiting and validation

### Rate Limits
- **General API:** 100 requests per 15 minutes per IP
- **NFT Creation:** 10 requests per hour per IP  
- **Batch Operations:** 3 requests per hour per IP
- **Read Operations:** 200 requests per 15 minutes per IP

### XRPL Integration
This API integrates with the XRP Ledger to mint NFTs representing baseball cards and other collectibles. The wallet funding feature uses the XRPL testnet faucet, which creates new wallets instead of funding existing addresses.

## Authentication

Authentication endpoints are planned but not yet implemented. All endpoints currently return 501 Not Implemented.

```typescript
// Future authentication will use JWT Bearer tokens
Authorization: Bearer <jwt_token>
```

## API Endpoints

### Health Check Endpoints

#### GET /health
Basic health check to verify API is running.

**Response:**
```json
{
  "success": true,
  "message": "Top Dog Arena API is running",
  "timestamp": "2025-07-23T03:29:05.442Z",
  "version": "1.1.0"
}
```

#### GET /health/detailed
Comprehensive health check including service status.

**Response:**
```json
{
  "success": true,
  "message": "All services operational",
  "timestamp": "2025-07-23T03:29:05.442Z",
  "version": "1.1.0",
  "environment": "development",
  "services": {
    "api": "healthy",
    "xrpl": "connected",
    "database": "connected"
  }
}
```

#### GET /health/xrpl
Check XRPL network connection and wallet status.

**Response:**
```json
{
  "success": true,
  "message": "XRPL connection healthy",
  "timestamp": "2025-07-23T03:29:05.442Z",
  "xrpl": {
    "network": "testnet",
    "serverUrl": "wss://s.altnet.rippletest.net:51233",
    "walletAddress": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
    "connected": true,
    "balance": {
      "balance": "30000000",
      "available": "30000000"
    }
  }
}
```

### Wallet Management Endpoints

#### POST /wallet/create
Generate a new XRPL wallet with address, seed, and keys.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD",
    "seed": "sEdVRjMcsuXZDaeWfPUXT8xTsQRgbf4",
    "publicKey": "ED...",
    "network": "testnet",
    "databaseId": "uuid-string"
  },
  "message": "Wallet created successfully",
  "warning": "Store seed securely - cannot be recovered",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /wallet/validate
Check if an XRPL address has valid format.

**Request:**
```json
{
  "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
    "isValid": true,
    "network": "testnet"
  },
  "message": "Address is valid",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /wallet/fund
Fund a wallet using XRPL testnet faucet (testnet only).

**Important:** The XRPL testnet faucet creates a new wallet instead of funding the requested address. Use the `actualAddress` and `seed` from the response to access the funded wallet.

**Request:**
```json
{
  "address": "rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requestedAddress": "rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD",
    "actualAddress": "rDWxewf8S2ze6dHVVuLxrh95MfuFFUeQe1",
    "balance": "10",
    "network": "testnet",
    "seed": "sEdVQQU2oN1tidWKJeKLQVVJ9FwVh4o",
    "note": "Testnet faucet created a new wallet instead of funding the requested address"
  },
  "message": "Wallet funded successfully from testnet faucet",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /wallet/sync-balance
Fetch and update wallet balance from XRPL network.

**Request:**
```json
{
  "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
    "balance": {
      "drops": "25000000",
      "xrp": "25.000000"
    },
    "synced": true
  },
  "message": "Balance synced successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /wallet/sync-all
Sync balances for all wallets in the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAccounts": 10,
    "successCount": 8,
    "errorCount": 2,
    "results": [
      {
        "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
        "success": true,
        "balance": "25000000",
        "error": null
      }
    ]
  },
  "message": "Batch sync completed",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### GET /wallet/list
Retrieve all wallet information from the database.

**Query Parameters:**
- `limit` (optional): Maximum number of wallets to return (1-1000)
- `includeSecrets` (optional): Include sensitive data for owned wallets (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "wallets": [
      {
        "id": "cld3fgh8900001234567890",
        "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
        "network": "testnet",
        "balance": "25000000",
        "balanceXRP": "25.000000",
        "isOwned": true,
        "isActive": true,
        "nickname": "Main Trading Wallet",
        "description": "Primary wallet for NFT trading operations",
        "tags": ["trading", "main", "production"],
        "createdAt": "2025-07-22T10:30:00.000Z",
        "updatedAt": "2025-07-22T15:45:30.000Z",
        "lastSyncAt": "2025-07-22T15:45:30.000Z",
        "nftCount": {
          "owned": 12,
          "issued": 5
        }
      }
    ],
    "count": 1,
    "total": 1
  },
  "message": "Wallets retrieved successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### GET /wallet/{address}
Retrieve specific wallet information by XRPL address.

**Path Parameters:**
- `address`: XRPL wallet address (pattern: `^r[1-9A-HJ-NP-Za-km-z]{25,34}$`)

**Query Parameters:**
- `includeSecrets` (optional): Include sensitive data for owned wallets (default: false)

**Response:** Same structure as individual wallet in `/wallet/list`

#### GET /wallet/stats
Retrieve comprehensive statistics about all wallets in the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWallets": 25,
    "ownedWallets": 15,
    "externalWallets": 10,
    "activeWallets": 20,
    "fundedWallets": 18,
    "unfundedWallets": 7,
    "networkDistribution": {
      "testnet": 20,
      "mainnet": 5,
      "devnet": 0
    },
    "recentlyCreated": 3,
    "recentlySynced": 15
  },
  "message": "Wallet statistics retrieved successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

### NFT Management Endpoints

#### POST /nft/create
Creates a single NFT on the XRPL. Requires XRPL wallet to be configured.

**Rate Limit:** 10 requests per hour per IP

**Request:**
```json
{
  "name": "Mike Trout - Angels Superstar",
  "description": "A legendary baseball card featuring Mike Trout in his Angels uniform.",
  "imageUrl": "https://topdogarena.com/images/cards/mike-trout-001.png",
  "attributes": [
    {
      "trait_type": "Player",
      "value": "Mike Trout"
    },
    {
      "trait_type": "Team",
      "value": "Los Angeles Angels"
    },
    {
      "trait_type": "Position",
      "value": "Center Field"
    },
    {
      "trait_type": "Rarity",
      "value": "Legendary"
    }
  ],
  "external_url": "https://topdogarena.com/players/mike-trout",
  "transferFee": 500
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "txHash": "E3FE6EA3D48F0C2B639448020EA4F03D4F4F8BDBD2397B43FE71618E38D4B277",
    "fee": "12",
    "metadata": {
      "name": "Mike Trout - Angels Superstar",
      "description": "A legendary baseball card featuring Mike Trout in his Angels uniform.",
      "image": "https://topdogarena.com/images/cards/mike-trout-001.png",
      "attributes": [
        {
          "trait_type": "Player",
          "value": "Mike Trout"
        }
      ],
      "external_url": "https://topdogarena.com/players/mike-trout"
    }
  },
  "message": "NFT created successfully"
}
```

#### POST /nft/batch-create
Creates up to 10 NFTs in a single batch operation.

**Rate Limit:** 3 requests per hour per IP

**Request:**
```json
{
  "nfts": [
    {
      "name": "Player Card 1",
      "description": "First player card",
      "image": "https://example.com/card1.png"
    },
    {
      "name": "Player Card 2", 
      "description": "Second player card",
      "image": "https://example.com/card2.png"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "index": 0,
        "nftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
        "txHash": "E3FE6EA3D48F0C2B639448020EA4F03D4F4F8BDBD2397B43FE71618E38D4B277",
        "fee": "12",
        "metadata": {
          "name": "Player Card 1",
          "description": "First player card",
          "image": "https://example.com/card1.png"
        }
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  },
  "message": "All NFTs created successfully"
}
```

#### GET /nft/{nftId}
Retrieve detailed information about a specific NFT.

**Path Parameters:**
- `nftId`: 64-character hexadecimal NFT ID

**Response:**
```json
{
  "success": true,
  "data": {
    "nft_id": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "ledger_index": 123456,
    "owner": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "is_burned": false,
    "flags": 8,
    "transfer_fee": 500,
    "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "nft_taxon": 0,
    "nft_serial": 1,
    "uri": "68747470733A2F2F746F70646F676172656E612E636F6D2F6D657461646174612F61626331323"
  },
  "message": "NFT details retrieved successfully"
}
```

#### GET /nft/account/{account}
Retrieve all NFTs owned by a specific XRPL account.

**Path Parameters:**
- `account`: XRPL account address

**Query Parameters:**
- `limit` (optional): Number of results to return (1-100, default: 20)
- `marker` (optional): Pagination marker for next page

**Response:**
```json
{
  "success": true,
  "data": {
    "account": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "nfts": [
      {
        "Flags": 8,
        "Issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
        "NFTokenID": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
        "NFTokenTaxon": 0,
        "TransferFee": 500,
        "URI": "68747470733A2F2F746F70646F676172656E612E636F6D2F6D657461646174612F61626331323",
        "nft_serial": 1
      }
    ],
    "count": 1
  },
  "message": "Account NFTs retrieved successfully"
}
```

#### GET /nft/wallet/info
Retrieve wallet and network configuration information.

**Response:**
```json
{
  "success": true,
  "data": {
    "network": {
      "network": "testnet",
      "serverUrl": "wss://s.altnet.rippletest.net:51233",
      "walletAddress": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b"
    },
    "balance": {
      "drops": "30000000",
      "xrp": "30.000000"
    },
    "connected": true,
    "clientConnected": true
  },
  "message": "Real XRPL wallet connected"
}
```

#### GET /api/stats/nft
Retrieve statistics about the NFT collection from the database.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalNFTs": 10,
    "totalAccounts": 5,
    "recentMints": 3,
    "totalTransactions": 25
  },
  "message": "NFT statistics retrieved successfully"
}
```

### Songbird Cross-Chain Endpoints

The API supports cross-chain NFT wrapping between XRPL and Songbird network.

#### GET /songbird/status
Get Songbird network connection status.

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "network": "songbird",
    "walletAddress": "0x742d35Cc6648C4532B3DCf4FA0EFC9bc57F8e16F",
    "contractAddress": "0x1234567890123456789012345678901234567890",
    "balance": "1.5 SGB"
  },
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /songbird/wrap
Wrap an XRPL NFT as an ERC721 token on the Songbird network.

**Request:**
```json
{
  "xrplNftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
  "xrplOwnerAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "songbirdRecipientAddress": "0x742d35Cc6648C4532B3DCf4FA0EFC9bc57F8e16F",
  "metadata": {
    "name": "Baseball Card #123",
    "description": "Rare rookie card",
    "image": "https://example.com/image.jpg",
    "attributes": []
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "songbirdTokenId": "1",
    "transactionHash": "0xabcdef...",
    "gasUsed": "150000"
  },
  "message": "NFT successfully wrapped to Songbird",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### POST /songbird/unwrap
Unwrap a Songbird ERC721 token back to the original XRPL NFT.

**Request:**
```json
{
  "songbirdTokenId": "1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "xrplNftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "transactionHash": "0xabcdef...",
    "gasUsed": "100000",
    "owner": "0x742d35Cc6648C4532B3DCf4FA0EFC9bc57F8e16F"
  },
  "message": "NFT successfully unwrapped from Songbird",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### GET /songbird/nft/{tokenId}
Retrieve detailed information about a wrapped NFT on Songbird.

**Response:**
```json
{
  "success": true,
  "data": {
    "xrplNftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "isWrapped": true,
    "owner": "0x742d35Cc6648C4532B3DCf4FA0EFC9bc57F8e16F",
    "tokenURI": "https://api.topdogarena.com/metadata/abc123",
    "metadata": {}
  },
  "message": "Wrapped NFT info retrieved successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### GET /songbird/gas/{operation}
Get gas cost estimates for wrapping or unwrapping operations.

**Path Parameters:**
- `operation`: "wrap" or "unwrap"

**Response:**
```json
{
  "success": true,
  "data": {
    "operation": "wrap",
    "gasLimit": "150000",
    "gasPrice": "25000000000",
    "estimatedCost": "0.00375 SGB"
  },
  "message": "Gas estimate for wrap operation",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### GET /songbird/wallet/{address}/nfts
Retrieve all wrapped NFTs owned by a specific wallet on Songbird.

**Response:**
```json
{
  "success": true,
  "data": {
    "wallet": "0x742d35Cc6648C4532B3DCf4FA0EFC9bc57F8e16F",
    "nfts": [
      {
        "tokenId": "1",
        "xrplNftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
        "isWrapped": true,
        "tokenURI": "https://api.topdogarena.com/metadata/abc123",
        "metadata": {}
      }
    ],
    "count": 3
  },
  "message": "Songbird NFTs retrieved successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

## Error Responses

### Standard Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable error message",
  "timestamp": "2025-07-23T03:04:33.102Z",
  "path": "/api/endpoint"
}
```

### Validation Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ],
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

### Rate Limit Error Response
```json
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": "15 minutes"
}
```

## Contact Information

- **Name:** Top Dog Arena
- **Website:** https://topdogarena.com
- **Email:** support@topdogarena.com
- **License:** MIT - https://opensource.org/licenses/MIT
