# Top Dog Arena - NFT API Endpoints

This document describes the API endpoints for creating and managing NFTs on the XRPL (XRP Ledger).

## Base URL

```
http://localhost:3004/api
```

## Authentication

Currently, all endpoints are public with rate limiting. Authentication will be added in future updates.

## Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **NFT Creation**: 10 requests per hour per IP
- **Batch Operations**: 3 requests per hour per IP
- **Read Operations**: 200 requests per 15 minutes per IP

## Wallet Endpoints

### 1. Fund Wallet

**POST** `/wallet/fund`

Funds a wallet with XRP from the testnet faucet. Creates the wallet if it doesn't exist.

#### Request Body

```json
{
  "address": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | XRPL address to fund |

#### Response

```json
{
  "success": true,
  "data": {
    "balanceDrops": "10000000",
    "balanceXRP": "10.000000",
    "requestedAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "actualAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "seed": "sEdTM1uX8pu2do5XvTnutH6HsouMaM2",
    "network": "testnet",
    "note": "Funding successful - 10 XRP added to wallet"
  },
  "message": "Wallet funded successfully"
}
```

### 2. Get Wallet Credentials

**GET** `/wallet/credentials/:address`

Retrieves stored private credentials for a wallet address.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | Yes | XRPL address to get credentials for |

#### Response

```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "seed": "sEdTM1uX8pu2do5XvTnutH6HsouMaM2",
    "balanceDrops": "10000000",
    "balanceXRP": "10.000000"
  },
  "message": "Wallet credentials retrieved successfully"
}
```

## NFT Endpoints

### 1. Create Single NFT

**POST** `/nft/create`

Creates a single NFT on the XRPL.

#### Request Body

```json
{
  "name": "Top Dog Baseball Card #001",
  "description": "A rare Top Dog Arena baseball card featuring superstar player.",
  "image": "https://example.com/images/card-001.png",
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
      "trait_type": "Rarity",
      "value": "Legendary"
    },
    {
      "trait_type": "Year",
      "value": 2024
    }
  ],
  "external_url": "https://topdogarena.com/cards/001",
  "animation_url": "https://example.com/animations/card-001.mp4",
  "transferFee": 1000,
  "recipient": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  "flags": 8
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | NFT name (max 100 chars) |
| `description` | string | Yes | NFT description (max 1000 chars) |
| `image` | string | Yes | URL to NFT image |
| `attributes` | array | No | Array of trait objects |
| `external_url` | string | No | External URL for more info |
| `animation_url` | string | No | URL to animation/video |
| `transferFee` | number | No | Transfer fee (0-50000, representing 0-50%) |
| `recipient` | string | No | XRPL address to mint directly to |
| `flags` | number | No | NFT flags (default: 8 for transferable) |

#### Response

```json
{
  "success": true,
  "data": {
    "nftId": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "txHash": "E3FE6EA3D48F0C2B639448020EA4F03D4F4F8BDBD2397B43FE71618E38D4B277",
    "fee": "12",
    "metadata": {
      "name": "Top Dog Baseball Card #001",
      "description": "A rare Top Dog Arena baseball card featuring superstar player.",
      "image": "https://example.com/images/card-001.png",
      "attributes": [...]
    }
  },
  "message": "NFT created successfully"
}
```

### 2. Batch Create NFTs

**POST** `/nft/batch-create`

Creates multiple NFTs in a single batch operation (max 10 NFTs).

#### Request Body

```json
{
  "nfts": [
    {
      "name": "Top Dog Baseball Card #001",
      "description": "A rare Top Dog Arena baseball card featuring superstar player.",
      "image": "https://example.com/images/card-001.png",
      "attributes": [...]
    },
    {
      "name": "Top Dog Baseball Card #002",
      "description": "Another rare Top Dog Arena baseball card.",
      "image": "https://example.com/images/card-002.png",
      "attributes": [...]
    }
  ]
}
```

#### Response

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
        "metadata": {...}
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "successful": 1,
      "failed": 1
    }
  },
  "message": "Batch creation completed: 1/2 successful"
}
```

### 3. Get NFT by ID

**GET** `/nft/:nftId`

Retrieves details of a specific NFT by its ID.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `nftId` | string | Yes | 64-character hexadecimal NFT ID |

#### Response

```json
{
  "success": true,
  "data": {
    "nft_id": "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65",
    "ledger_index": 32570,
    "owner": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "is_burned": false,
    "flags": 8,
    "transfer_fee": 1000,
    "issuer": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "nft_taxon": 0,
    "nft_serial": 12345,
    "uri": "68747470733A2F2F6578616D706C652E636F6D2F6D657461646174612F3030312E6A736F6E"
  },
  "message": "NFT details retrieved successfully"
}
```

### 4. Get Account NFTs

**GET** `/nft/account/:account`

Retrieves all NFTs owned by a specific XRPL account.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account` | string | Yes | XRPL address |

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of results (1-100, default: 20) |
| `marker` | string | No | Pagination marker |

#### Response

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
        "TransferFee": 1000,
        "URI": "68747470733A2F2F6578616D706C652E636F6D2F6D657461646174612F3030312E6A736F6E",
        "nft_serial": 12345
      }
    ],
    "count": 1
  },
  "message": "Account NFTs retrieved successfully"
}
```

### 5. Get Wallet Info

**GET** `/nft/wallet/info`

Retrieves wallet and network information.

#### Response

```json
{
  "success": true,
  "data": {
    "network": {
      "network": "testnet",
      "serverUrl": "wss://s.altnet.rippletest.net:51233",
      "walletAddress": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
    },
    "balance": {
      "balanceDrops": "999988000000",
      "balanceXRP": "999.988000",
      "balance": "999988000000",
      "available": "999968000000"
    }
  },
  "message": "Wallet info retrieved successfully"
}
```

## Health Check Endpoints

### 1. Basic Health Check

**GET** `/health`

Basic API health check.

### 2. Detailed Health Check  

**GET** `/health/detailed`

Detailed health check including service status.

### 3. XRPL Health Check

**GET** `/health/xrpl`

XRPL-specific health and connection status.

## Error Responses

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid request data",
  "timestamp": "2024-07-20T10:30:00.000Z",
  "path": "/api/nft/create",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `207` - Multi-Status (partial success for batch operations)
- `400` - Bad Request
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `503` - Service Unavailable

## Examples

### Creating a Baseball Card NFT

```bash
curl -X POST http://localhost:3004/api/nft/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Trout - Angels Superstar",
    "description": "A legendary baseball card featuring Mike Trout in his Angels uniform.",
    "image": "https://topdogarena.com/images/cards/mike-trout-001.png",
    "attributes": [
      {"trait_type": "Player", "value": "Mike Trout"},
      {"trait_type": "Team", "value": "Los Angeles Angels"},
      {"trait_type": "Position", "value": "Center Field"},
      {"trait_type": "Rarity", "value": "Legendary"},
      {"trait_type": "Year", "value": 2024},
      {"trait_type": "Stats", "value": "3x MVP"}
    ],
    "external_url": "https://topdogarena.com/players/mike-trout",
    "transferFee": 500
  }'
```

### Checking NFT Details

```bash
curl http://localhost:3004/api/nft/000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65
```

### Getting Account NFTs

```bash
curl "http://localhost:3004/api/nft/account/rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH?limit=10"
```

## Notes

- All URLs in metadata should be HTTPS
- NFT IDs are 64-character hexadecimal strings
- Transfer fees are specified in 1/100,000th units (10000 = 10%)
- The `flags` field controls NFT properties (8 = transferable)
- Batch operations include a 500ms delay between each NFT creation
- XRPL addresses follow the format: `r[1-9A-HJ-NP-Za-km-z]{25,34}`
