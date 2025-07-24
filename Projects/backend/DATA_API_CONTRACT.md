# Top Dog Arena Data API Contract

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Database:** SQLite with Prisma ORM  
**Last Updated:** July 22, 2025

## 🎯 Purpose

This document provides a complete API contract for AI assistants and developers to build applications that interact with the Top Dog Arena NFT database. All endpoints return structured data from our SQLite database with full XRPL blockchain integration.

## 🗄️ Database Schema Overview

### Tables
- **`accounts`** - XRPL wallet addresses and metadata
- **`nfts`** - Complete NFT records with attributes and blockchain data  
- **`transactions`** - XRPL transaction history and audit logs
- **`api_keys`** - API key management (future)
- **`api_requests`** - Request logging and analytics (future)

### Key Relationships
- `nfts.issuerAddress` → `accounts.address`
- `nfts.ownerAddress` → `accounts.address`  
- `transactions.nftTokenID` → `nfts.nftTokenID`

## 📊 Data Retrieval Endpoints

### 1. NFT Data Endpoints

#### Get NFT by ID
```http
GET /api/nft/{nftId}
```

**Parameters:**
- `nftId` (string, required): 64-character hex NFT ID from XRPL

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "nftId": "000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE",
    "name": "Database Integration Success",
    "description": "Final test of NFT creation with database storage",
    "imageUrl": "https://example.com/success.jpg",
    "attributes": [
      {
        "trait_type": "Final",
        "value": "True"
      }
    ],
    "owner": {
      "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
      "nickname": null
    },
    "issuer": {
      "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b", 
      "nickname": null
    },
    "txHash": "2DB65A2199475DA6CD0CA4F27EAAF639D1012087C937CD296BAF4D621BA4E0B7",
    "fee": "12",
    "mintedAt": "2025-07-22T18:33:59.998Z",
    "category": "collectible",
    "rarity": null,
    "isBurned": false,
    "isTransferable": true
  },
  "timestamp": "2025-07-22T18:34:58.903Z"
}
```

#### Get NFTs by Owner Account
```http
GET /api/nft/account/{account}?limit=20&offset=0
```

**Parameters:**
- `account` (string, required): XRPL address starting with 'r'
- `limit` (integer, optional): Results per page (1-100, default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "account": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
    "nfts": [
      {
        "nftId": "000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE",
        "name": "Database Integration Success",
        "description": "Final test of NFT creation with database storage",
        "imageUrl": "https://example.com/success.jpg",
        "attributes": [
          {
            "trait_type": "Final",
            "value": "True"
          }
        ],
        "issuer": {
          "address": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
          "nickname": null
        },
        "txHash": "2DB65A2199475DA6CD0CA4F27EAAF639D1012087C937CD296BAF4D621BA4E0B7",
        "mintedAt": "2025-07-22T18:33:59.998Z",
        "category": "collectible",
        "rarity": null
      }
    ],
    "count": 1,
    "limit": 20,
    "offset": 0
  },
  "timestamp": "2025-07-22T18:35:08.054Z"
}
```

### 2. Statistics and Analytics Endpoints

#### NFT Statistics
```http
GET /api/stats/nft
```

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "totalNFTs": 1,
    "activeNFTs": 1,
    "burnedNFTs": 0,
    "totalAccounts": 1,
    "recentMints": 1
  },
  "message": "NFT statistics retrieved successfully",
  "timestamp": "2025-07-22T18:34:42.903Z"
}
```

### 3. Account Information Endpoints

#### Get Wallet Information
```http
GET /api/nft/wallet/info
```

**Response Schema:**
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
      "drops": "29999916",
      "xrp": "29.999916"
    },
    "connected": true,
    "clientConnected": true
  },
  "message": "Real XRPL wallet connected"
}
```

### 4. Health and System Status

#### Detailed System Health
```http
GET /api/health/detailed
```

**Response Schema:**
```json
{
  "success": true,
  "message": "Top Dog Arena API health check",
  "timestamp": "2025-07-22T18:09:46.445Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "api": "healthy",
    "xrpl": "connected",
    "database": "connected"
  },
  "xrpl": {
    "connected": true,
    "walletConfigured": true,
    "network": "testnet"
  },
  "database": {
    "connected": true,
    "responseTime": 58
  }
}
```

### 5. Wallet Management Endpoints

#### Fund Wallet from Testnet Faucet
```http
POST /api/wallet/fund
```

**Request Schema:**
```json
{
  "address": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
}
```

**Response Schema:**
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
  "message": "Wallet funded successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

#### Get Wallet Credentials
```http
GET /api/wallet/credentials/{address}
```

**Parameters:**
- `address` (string, required): XRPL wallet address

**Response Schema:**
```json
{
  "success": true,
  "data": {
    "address": "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
    "seed": "sEdTM1uX8pu2do5XvTnutH6HsouMaM2",
    "balanceDrops": "10000000",
    "balanceXRP": "10.000000"
  },
  "message": "Wallet credentials retrieved successfully",
  "timestamp": "2025-07-23T03:04:33.102Z"
}
```

## 🎨 NFT Creation Endpoint

#### Create NFT with Database Storage
```http
POST /api/nft/create
```

**Request Schema:**
```json
{
  "name": "Player Name - Team",
  "description": "Description of the NFT",
  "imageUrl": "https://example.com/image.jpg",
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
  ]
}
```

**Response Schema:**
```json
{
  "success": true,
  "message": "NFT created successfully on XRPL testnet",
  "data": {
    "nftId": "000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE",
    "txHash": "2DB65A2199475DA6CD0CA4F27EAAF639D1012087C937CD296BAF4D621BA4E0B7",
    "account": "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b",
    "name": "Player Name - Team",
    "description": "Description of the NFT",
    "imageUrl": "https://example.com/image.jpg",
    "attributes": [
      {
        "trait_type": "Player",
        "value": "Mike Trout"
      }
    ],
    "fee": "12",
    "network": "XRPL Testnet"
  },
  "timestamp": "2025-07-22T18:34:00.117Z"
}
```

## 🗃️ Database Models (Prisma Schema)

### Account Model
```typescript
model Account {
  id          String   @id @default(cuid())
  address     String   @unique // XRPL wallet address
  seed        String?  // Encrypted wallet seed
  publicKey   String?  // XRPL public key
  privateKey  String?  // Encrypted private key
  network     String   @default("testnet")
  balance     String?  // Balance in drops
  balanceXRP  String?  // Balance in XRP
  isOwned     Boolean  @default(false)
  isActive    Boolean  @default(true)
  nickname    String?
  description String?
  tags        String?  // JSON array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastSyncAt  DateTime?
  nftsOwned   NFT[]    @relation("NFTOwner")
  nftsIssued  NFT[]    @relation("NFTIssuer")
}
```

### NFT Model
```typescript
model NFT {
  id             String   @id @default(cuid())
  nftTokenID     String   @unique // XRPL NFTokenID
  issuerAddress  String   // Minter address
  ownerAddress   String   // Current owner
  flags          Int?
  transferFee    Int?
  nftTaxon       Int?
  nftSerial      Int?
  uri            String?  // Hex-encoded metadata
  name           String?
  description    String?
  imageUrl       String?
  imageHash      String?
  animationUrl   String?
  externalUrl    String?
  attributes     String?  // JSON array
  txHash         String?  // Mint transaction hash
  ledgerIndex    Int?
  fee            String?  // Transaction fee
  isBurned       Boolean  @default(false)
  isTransferable Boolean  @default(true)
  category       String?  // baseball_card, collectible
  rarity         String?  // common, rare, legendary
  season         String?
  player         String?
  team           String?
  position       String?
  isForSale      Boolean  @default(false)
  priceXRP       String?
  priceDrop      String?
  marketplaceUrl String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  mintedAt       DateTime?
  lastSyncAt     DateTime?
  issuer         Account  @relation("NFTIssuer", fields: [issuerAddress], references: [address])
  owner          Account  @relation("NFTOwner", fields: [ownerAddress], references: [address])
}
```

### Transaction Model
```typescript
model Transaction {
  id            String   @id @default(cuid())
  txHash        String   @unique
  txType        String   // NFTokenMint, NFTokenBurn, etc.
  account       String
  fee           String
  sequence      Int?
  ledgerIndex   Int?
  nftTokenID    String?
  amount        String?
  destination   String?
  validated     Boolean  @default(false)
  successful    Boolean  @default(false)
  errorCode     String?
  errorMessage  String?
  memo          String?
  metadata      String?  // JSON
  createdAt     DateTime @default(now())
  submittedAt   DateTime?
  validatedAt   DateTime?
}
```

## 🔧 AI Integration Patterns

### 1. Data Dashboard Builder
```javascript
// Build comprehensive NFT dashboard
async function buildNFTDashboard() {
  // Get system health
  const health = await fetch('/api/health/detailed').then(r => r.json());
  
  // Get NFT statistics  
  const stats = await fetch('/api/stats/nft').then(r => r.json());
  
  // Get wallet info
  const wallet = await fetch('/api/nft/wallet/info').then(r => r.json());
  
  return {
    systemHealth: health.data,
    nftStats: stats.data,
    walletInfo: wallet.data
  };
}
```

### 2. NFT Explorer Builder
```javascript
// Build NFT explorer with pagination
async function exploreNFTs(account, page = 0, limit = 20) {
  const offset = page * limit;
  const url = `/api/nft/account/${account}?limit=${limit}&offset=${offset}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    nfts: data.data.nfts,
    pagination: {
      current: page,
      limit: limit,
      total: data.data.count,
      hasNext: data.data.count > (offset + limit)
    }
  };
}
```

### 3. NFT Detail Viewer Builder
```javascript
// Build detailed NFT viewer
async function getNFTDetails(nftId) {
  const response = await fetch(`/api/nft/${nftId}`);
  const data = await response.json();
  
  if (data.success) {
    return {
      metadata: {
        name: data.data.name,
        description: data.data.description,
        image: data.data.imageUrl,
        attributes: data.data.attributes
      },
      blockchain: {
        nftId: data.data.nftId,
        txHash: data.data.txHash,
        fee: data.data.fee,
        mintedAt: data.data.mintedAt
      },
      ownership: {
        owner: data.data.owner,
        issuer: data.data.issuer,
        isTransferable: data.data.isTransferable,
        isBurned: data.data.isBurned
      }
    };
  }
  return null;
}
```

## 📈 Analytics and Reporting Patterns

### NFT Collection Analytics
```javascript
// Get collection overview
async function getCollectionAnalytics() {
  const stats = await fetch('/api/stats/nft').then(r => r.json());
  
  return {
    overview: {
      totalNFTs: stats.data.totalNFTs,
      activeNFTs: stats.data.activeNFTs,
      burnedNFTs: stats.data.burnedNFTs,
      burnRate: (stats.data.burnedNFTs / stats.data.totalNFTs * 100).toFixed(2)
    },
    growth: {
      recentMints: stats.data.recentMints,
      totalAccounts: stats.data.totalAccounts
    }
  };
}
```

## 🚨 Error Handling Patterns

### Database Error Responses
```json
{
  "success": false,
  "error": "Database error",
  "message": "Failed to retrieve NFT from database",
  "timestamp": "2025-07-22T18:35:08.054Z"
}
```

### Validation Error Responses  
```json
{
  "success": false,
  "error": "Invalid NFT ID format",
  "message": "NFT ID must be a 64-character hexadecimal string",
  "timestamp": "2025-07-22T18:35:08.054Z"
}
```

### Not Found Responses
```json
{
  "success": false,
  "error": "NFT not found", 
  "message": "NFT with ID {nftId} not found in database",
  "timestamp": "2025-07-22T18:35:08.054Z"
}
```

## 🔒 Data Types and Validation

### NFT ID Format
- **Pattern:** `^[0-9A-Fa-f]{64}$`
- **Example:** `000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE`

### XRPL Address Format  
- **Pattern:** `^r[1-9A-HJ-NP-Za-km-z]{25,34}$`
- **Example:** `rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b`

### Transaction Hash Format
- **Pattern:** `^[0-9A-Fa-f]{64}$` 
- **Example:** `2DB65A2199475DA6CD0CA4F27EAAF639D1012087C937CD296BAF4D621BA4E0B7`

### Balance Formats
- **Drops:** String representation of integer (1 XRP = 1,000,000 drops)
- **XRP:** String with up to 6 decimal places

## 📋 Testing Endpoints

All endpoints can be tested with:

```bash
# Health check
curl http://localhost:3004/api/health

# NFT stats  
curl http://localhost:3004/api/stats/nft

# Get NFT by ID
curl http://localhost:3004/api/nft/000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE

# Get account NFTs
curl http://localhost:3004/api/nft/account/rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b
```

## 🎯 Use Cases for AI Applications

### 1. **NFT Marketplace Frontend**
- Browse NFTs by owner/issuer
- Display detailed NFT information
- Show transaction history
- Real-time statistics dashboard

### 2. **Discord/Telegram Bots**
- NFT lookup commands
- Collection statistics  
- Wallet balance checking
- NFT creation workflows

### 3. **Analytics Dashboards**
- Collection growth metrics
- User adoption tracking
- Transaction volume analysis
- Rarity distribution charts

### 4. **Portfolio Trackers**
- User NFT collections
- Value tracking over time
- Transfer history
- Ownership verification

## 📖 Additional Resources

- **Interactive API Docs:** `http://localhost:3004/api-docs`
- **OpenAPI Spec:** `http://localhost:3004/openapi.json`
- **Database Schema:** `./prisma/schema.prisma`
- **AI Assistant Guide:** `./AI_ASSISTANT_GUIDE.md`

This data contract provides everything an AI needs to build comprehensive applications using the Top Dog Arena NFT database! 🚀
