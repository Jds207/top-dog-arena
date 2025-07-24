# Top Dog Arena NFT API - AI Assistant Guide

This guide provides comprehensive information for AI assistants to interact with the Top Dog Arena NFT API for creating and managing baseball card NFTs on the XRPL.

## 🚀 Quick Start

**API Base URL:** `http://localhost:3000/api` (Database-integrated server)  
**Documentation:** `http://localhost:3000/api-docs` (Swagger UI)  
**OpenAPI Spec:** `./openapi.yaml`  
**Data Contract:** `./DATA_API_CONTRACT.md` (Complete database API reference)

### Essential Endpoints for AI Assistants

```bash
# System Health & Status
GET /api/health                  # Basic API status
GET /api/health/detailed         # Detailed system status
GET /api/health/xrpl            # XRPL connection status

# Wallet Management
POST /api/wallet/create          # Create new XRPL wallet
POST /api/wallet/validate        # Validate XRPL address format
POST /api/wallet/fund           # Fund wallet from testnet faucet
POST /api/wallet/sync-balance    # Sync single wallet balance
POST /api/wallet/sync-all        # Sync all wallet balances
GET /api/nft/wallet/info        # Get main wallet info

# NFT Operations
POST /api/nft/create            # Create NFT (saves to XRPL + database)
GET /api/nft/{nftId}            # Get NFT details from database
GET /api/nft/account/{account}   # Get NFTs by owner account

# Statistics & Data
GET /api/stats                  # General API statistics
GET /api/stats/nft             # NFT-specific statistics
```

## 📋 API Status Interpretation

### Health Check Results
- ✅ `success: true` = API is online and responsive
- ❌ `success: false` = API has issues

### XRPL Status Results
- ✅ `connected: true` = Ready to create NFTs
- ⚠️ `connected: false` = Wallet not configured
- ❌ Error response = XRPL connection issues

## 🎯 Common AI Assistant Tasks

### 1. **Test Connectivity**
```javascript
// Check basic connectivity
const health = await fetch('/api/health');
const status = await health.json();

if (status.success) {
  console.log('✅ API is online');
} else {
  console.log('❌ API is offline');
}
```

### 2. **Check System and Database Readiness**
```javascript
// Check if system is fully operational
const detailedHealth = await fetch('/api/health/detailed');
const health = await detailedHealth.json();

if (health.services.api === 'healthy' && 
    health.services.xrpl === 'connected' && 
    health.services.database === 'connected') {
  console.log('✅ System fully operational - Ready for all operations');
  console.log(`💾 Database response time: ${health.database.responseTime}ms`);
  console.log(`💰 XRP Balance: Connected`);
} else {
  console.log('⚠️ System not fully ready:', health.services);
}
```

### 3. **Get Database Statistics**
```javascript
// Get NFT collection statistics
const stats = await fetch('/api/stats/nft');
const data = await stats.json();

if (data.success) {
  console.log(`📊 NFT Collection Stats:
    Total NFTs: ${data.data.totalNFTs}
    Active NFTs: ${data.data.activeNFTs}
    Total Accounts: ${data.data.totalAccounts}
    Recent Mints (24h): ${data.data.recentMints}`);
}
```

### 4. **Get NFT from Database**
```javascript
// Retrieve NFT details from database
const nftId = "000800006C17D64B064AFCF2F36CA70349DF644CA3529DB2A4F98199008B19FE";
const response = await fetch(`/api/nft/${nftId}`);
const nftData = await response.json();

if (nftData.success) {
  const nft = nftData.data;
  console.log(`🎨 NFT Details:
    Name: ${nft.name}
    Owner: ${nft.owner.address}
    Minted: ${nft.mintedAt}
    Transaction: ${nft.txHash}
    Attributes: ${nft.attributes.length} traits`);
}
```

### 5. **Get Account's NFT Collection**
```javascript
// Get all NFTs owned by an account
const account = "rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b";
const response = await fetch(`/api/nft/account/${account}`);
const collection = await response.json();

if (collection.success) {
  console.log(`🎯 Account ${account} owns ${collection.data.count} NFTs:`);
  collection.data.nfts.forEach(nft => {
    console.log(`- ${nft.name} (${nft.category || 'collectible'})`);
  });
}
```

### 3. **Create Baseball Card NFT**
```javascript
const nftData = {
  "name": "Mike Trout - Angels Superstar",
  "description": "A legendary baseball card featuring Mike Trout in his Angels uniform.",
  "image": "https://topdogarena.com/images/cards/mike-trout-001.png",
  "attributes": [
    {"trait_type": "Player", "value": "Mike Trout"},
    {"trait_type": "Team", "value": "Los Angeles Angels"},
    {"trait_type": "Position", "value": "Center Field"},
    {"trait_type": "Rarity", "value": "Legendary"},
    {"trait_type": "Year", "value": 2025}
  ],
  "external_url": "https://topdogarena.com/players/mike-trout",
  "transferFee": 500
};

const response = await fetch('/api/nft/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(nftData)
});

const result = await response.json();
if (result.success) {
  console.log('✅ NFT created:', result.data.nftId);
} else {
  console.log('❌ NFT creation failed:', result.error);
}
```

## 🏦 Wallet Management Guide

The API provides comprehensive wallet management capabilities for AI assistants:

### 1. **Create New XRPL Wallets**
```javascript
// Generate a new XRPL wallet
const response = await fetch('/api/wallet/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const result = await response.json();
if (result.success) {
  console.log(`✅ New wallet created: ${result.data.address}`);
  console.log(`🔑 Seed: ${result.data.seed}`); // STORE SECURELY!
  console.log(`🆔 Database ID: ${result.data.databaseId}`);
} else {
  console.log('❌ Wallet creation failed:', result.error);
}
```

### 2. **Validate XRPL Addresses**
```javascript
// Check if an address is valid
const response = await fetch('/api/wallet/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: 'rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b' 
  })
});

const result = await response.json();
console.log(`Address valid: ${result.data.isValid}`);
```

### 3. **Fund Wallets (Testnet Only)**
```javascript
// Fund a wallet from testnet faucet
const response = await fetch('/api/wallet/fund', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: 'rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD' 
  })
});

const result = await response.json();
if (result.success) {
  console.log(`💰 Funded with ${result.data.balanceXRP} XRP (${result.data.balanceDrops} drops)`);
  console.log(`🏦 Actual address: ${result.data.actualAddress}`);
  console.log(`🔑 Seed: ${result.data.seed}`);
} else {
  console.log('❌ Funding failed:', result.error);
}

// Example successful response:
// {
//   "success": true,
//   "data": {
//     "requestedAddress": "rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD",
//     "actualAddress": "rBcXeXYok6AMw3VeRSR2KxUVPQnKJtbsm6",
//     "balanceDrops": "10000000",
//     "balanceXRP": "10.000000",
//     "network": "testnet",
//     "seed": "sEd7Cgw3oio33q74LWUSTzcSn8HPpvN",
//     "note": "Testnet faucet created a new wallet instead of funding the requested address"
//   }
// }
```

### 4. **Sync Wallet Balances**
```javascript
// Sync single wallet balance from XRPL
const response = await fetch('/api/wallet/sync-balance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    address: 'rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b' 
  })
});

const result = await response.json();
if (result.success) {
  console.log(`💰 Balance: ${result.data.balance.xrp} XRP`);
} else {
  console.log('❌ Account not found (unfunded)');
}
```

### 5. **Sync All Wallet Balances**
```javascript
// Sync all wallets at once
const response = await fetch('/api/wallet/sync-all', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

const result = await response.json();
if (result.success) {
  console.log(`📊 Synced ${result.data.successCount}/${result.data.totalAccounts} wallets`);
  result.data.results.forEach(wallet => {
    if (wallet.success) {
      console.log(`✅ ${wallet.address}: ${wallet.balance}`);
    } else {
      console.log(`❌ ${wallet.address}: ${wallet.error}`);
    }
  });
}
```

### 🔑 Important Notes:
- **Wallet Seeds**: Store securely! Cannot be recovered if lost
- **Unfunded Wallets**: New wallets don't exist on XRPL until funded
- **Testnet Faucets**: Only available on testnet for development
- **Balance Sync**: "Not synced" means balance hasn't been fetched from XRPL yet

## 🔧 Configuration Requirements

### For Full Functionality
The API needs these environment variables configured:

```bash
# XRPL Configuration
XRPL_NETWORK=testnet
XRPL_SERVER_URL=wss://s.altnet.rippletest.net:51233
XRPL_WALLET_SEED=your_wallet_seed_here

# Database (optional)
DATABASE_URL=postgresql://username:password@localhost:5432/top_dog_arena
```

### Without Configuration
- ✅ Health checks work
- ✅ API documentation accessible
- ❌ NFT creation returns "XRPL service not configured"
- ❌ NFT queries return service unavailable

## 📚 Complete Endpoint Reference

### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Service status details
- `GET /api/health/xrpl` - XRPL connection status

### NFT Endpoints
- `POST /api/nft/create` - Create single NFT
- `POST /api/nft/batch-create` - Create up to 10 NFTs
- `GET /api/nft/:nftId` - Get NFT details by ID
- `GET /api/nft/account/:account` - Get account NFTs
- `GET /api/nft/wallet/info` - Get wallet information

### Auth Endpoints (Future)
- `POST /api/auth/register` - Register user (501 Not Implemented)
- `POST /api/auth/login` - Login user (501 Not Implemented)

## 🎮 Baseball Card Templates

### Rarity Levels
```javascript
const rarityConfig = {
  "Common": { transferFee: 250, color: "#8B7355" },
  "Uncommon": { transferFee: 500, color: "#4A90E2" },
  "Rare": { transferFee: 750, color: "#9013FE" },
  "Epic": { transferFee: 1000, color: "#FF6D00" },
  "Legendary": { transferFee: 1500, color: "#FFD700" }
};
```

### Player Positions
```javascript
const positions = [
  "Pitcher", "Catcher", "First Base", "Second Base", 
  "Third Base", "Shortstop", "Left Field", 
  "Center Field", "Right Field", "Designated Hitter"
];
```

### MLB Teams
```javascript
const teams = [
  "Los Angeles Angels", "Houston Astros", "Oakland Athletics",
  "Seattle Mariners", "Texas Rangers", "Atlanta Braves",
  // ... full list in API documentation
];
```

## ⚡ Rate Limits

**Important for AI Assistants:**
- General API: 100 requests per 15 minutes
- NFT Creation: 10 requests per hour
- Batch Operations: 3 requests per hour
- Read Operations: 200 requests per 15 minutes

### Rate Limit Headers
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1642694400
```

## 🔍 Error Handling

### Common Error Responses
```javascript
// Validation Error (400)
{
  "success": false,
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": [
    {"field": "name", "message": "Name is required"}
  ]
}

// Rate Limited (429)
{
  "success": false,
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": "15 minutes"
}

// Service Not Configured (503)
{
  "success": false,
  "error": "XRPL service not configured",
  "message": "Please configure XRPL wallet to enable NFT creation"
}
```

## 🤖 AI Assistant Best Practices

### 1. **Always Check Connectivity First**
```javascript
// Before any NFT operations
const status = await checkAPIHealth();
if (!status.success) {
  return "API is currently offline. Please try again later.";
}
```

### 2. **Validate Data Before Sending**
```javascript
// Validate required fields
if (!name || !description || !image) {
  return "Missing required fields: name, description, and image are required.";
}

// Validate URLs
if (!isValidURL(image)) {
  return "Image URL must be a valid HTTPS URL.";
}
```

### 3. **Handle Rate Limits Gracefully**
```javascript
if (response.status === 429) {
  const retryAfter = response.headers.get('RateLimit-Reset');
  return `Rate limit exceeded. Please wait ${retryAfter} before trying again.`;
}
```

### 4. **Provide Clear Status Updates**
```javascript
// For NFT creation
if (result.success) {
  return `✅ NFT created successfully! 
    NFT ID: ${result.data.nftId}
    Transaction: ${result.data.txHash}
    Fee: ${result.data.fee} drops`;
} else {
  return `❌ Failed to create NFT: ${result.error}`;
}
```

## 🔗 Integration Examples

### For Discord Bots
```javascript
// Discord slash command example
async function createNFTCommand(interaction) {
  const playerName = interaction.options.getString('player');
  const team = interaction.options.getString('team');
  
  await interaction.deferReply();
  
  const result = await createBaseballCardNFT(playerName, team);
  
  if (result.success) {
    await interaction.editReply(`⚾ Created ${playerName} NFT! ID: ${result.data.nftId}`);
  } else {
    await interaction.editReply(`❌ Failed: ${result.error}`);
  }
}
```

### For Web Applications
```javascript
// React component example
const NFTCreator = () => {
  const [status, setStatus] = useState('checking');
  
  useEffect(() => {
    checkAPIHealth().then(health => {
      setStatus(health.success ? 'ready' : 'offline');
    });
  }, []);
  
  if (status === 'offline') {
    return <div>API is currently offline</div>;
  }
  
  return <NFTCreationForm />;
};
```

## 📖 OpenAPI/Swagger Documentation

Full interactive documentation is available at: `http://localhost:3000/api-docs`

The OpenAPI specification includes:
- Complete endpoint documentation
- Request/response schemas
- Example requests and responses
- Try-it-out functionality
- Rate limiting information
- Error response formats

This allows AI assistants to:
- Understand all available endpoints
- Generate proper request formats
- Handle all possible response types
- Implement proper error handling
- Respect rate limits and constraints

## 🎯 Summary for AI Assistants

The Top Dog Arena NFT API provides:
- ✅ Baseball card NFT creation on XRPL with database storage
- ✅ Complete SQLite database with NFT, account, and transaction data
- ✅ Real-time statistics and analytics endpoints
- ✅ Comprehensive health monitoring (API + XRPL + Database)
- ✅ Full data retrieval APIs for building applications
- ✅ OpenAPI/Swagger documentation
- ✅ Rate limiting and validation
- ✅ Clear error messages and connectivity testing

### 📚 Documentation Resources:
- **`AI_ASSISTANT_GUIDE.md`** - This file (AI integration guide)
- **`DATA_API_CONTRACT.md`** - Complete database API contract with schemas
- **`openapi.yaml`** - Full OpenAPI specification
- **`/api-docs`** - Interactive Swagger documentation

Perfect for AI assistants building NFT applications, Discord bots, analytics dashboards, or web interfaces for baseball card collectibles! 🎨⚡🗄️
