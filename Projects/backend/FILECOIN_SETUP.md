# Filecoin + IPFS Setup Guide

## 🎯 Quick Start

### 1. **Pinata Setup (IPFS)**
1. Go to [Pinata.cloud](https://www.pinata.cloud/)
2. Create free account (1GB free storage)
3. Generate API keys:
   - Go to **API Keys** section
   - Click **New Key**
   - Select **Pinning Services API**
   - Copy `API Key` and `API Secret`

### 2. **Lighthouse Setup (Filecoin)**
1. Go to [Lighthouse.storage](https://lighthouse.storage/)
2. Sign up and verify email
3. Create API key:
   - Go to **Dashboard** → **API Keys**
   - Click **Generate New Key**
   - Copy the API key

### 3. **Environment Configuration**
Update your `.env` file:
```bash
# IPFS & Filecoin Configuration
PINATA_API_KEY=your_actual_pinata_api_key
PINATA_SECRET_KEY=your_actual_pinata_secret
IPFS_GATEWAY=https://gateway.pinata.cloud
FILECOIN_API_KEY=your_lighthouse_api_key
FILECOIN_NETWORK=testnet  # or mainnet
```

## 🧪 Testing Setup

### Test IPFS Upload
```typescript
import { ipfsService } from './src/services/ipfs.service';

// Test basic IPFS upload
const testImage = Buffer.from('test image data');
const ipfsUrl = await ipfsService.uploadImage(testImage, 'test.png');
console.log('✅ IPFS URL:', ipfsUrl);
```

### Test Filecoin Integration
```typescript
// Test Filecoin upload (includes IPFS)
const result = await ipfsService.uploadToFilecoin(testImage, 'test-filecoin.png');
console.log('🔥 Filecoin Result:', result);
// Returns: { ipfsUrl, filecoinDealId, cid, lighthouseUrl }
```

## 🌐 Available Networks

### Lighthouse Testnet
- **Network**: Free tier available
- **Storage**: 100MB free
- **Purpose**: Development & testing
- **No setup required**: Just use your API key

### Lighthouse Mainnet
- **Network**: Production storage
- **Cost**: Pay-as-you-go pricing
- **Storage**: Unlimited
- **Payment**: Credit card or crypto

## 🔄 Migration Path

### Phase 1: IPFS Only (Current)
```typescript
// Upload image to IPFS via Pinata
const ipfsUrl = await ipfsService.uploadImageFromUrl(imageUrl);
// Store ipfsUrl in XRPL NFT
```

### Phase 2: Add Filecoin Backup
```typescript
// Upload to IPFS + create Filecoin deal
const result = await ipfsService.uploadToFilecoin(imageBuffer, filename);
// Store result.ipfsUrl in XRPL NFT
// result.filecoinDealId provides backup proof
```

### Phase 3: Smart Redundancy
```typescript
// Check availability across multiple gateways
const availability = await ipfsService.testIPFSAvailability(cid);
if (availability.workingGateways.length < 2) {
  // Create new Filecoin deal for redundancy
  await ipfsService.uploadToFilecoin(imageBuffer, filename);
}
```

## 💰 Cost Comparison

| Service | Storage | Retrieval | Permanence | Free Tier |
|---------|---------|-----------|------------|-----------|
| **Pinata** | $0.15/GB/month | Free | As long as paid | 1GB |
| **Lighthouse** | $0.10/GB/month | Free | Long-term deals | 100MB |
| **Traditional CDN** | $5-20/month | $0.10/GB | Until you stop paying | Usually 1GB |

## 🚀 Production Checklist

- [ ] Pinata API keys configured
- [ ] Lighthouse API key configured  
- [ ] Test image upload working
- [ ] Test Filecoin deal creation
- [ ] Monitor deal status endpoint
- [ ] Implement error fallbacks
- [ ] Set up redundancy monitoring

## 🛠️ API Endpoints to Add

```typescript
// Add to your NFT controller
POST /api/nft/upload-to-filecoin
GET /api/nft/check-deal-status/:dealId
GET /api/nft/test-availability/:cid
```

## 📚 Resources

- [Lighthouse Docs](https://docs.lighthouse.storage/)
- [Pinata Docs](https://docs.pinata.cloud/)
- [IPFS Docs](https://docs.ipfs.io/)
- [Filecoin Docs](https://docs.filecoin.io/)
