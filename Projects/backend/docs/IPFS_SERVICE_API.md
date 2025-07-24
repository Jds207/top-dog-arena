# IPFS Service API Documentation

## Overview

The `IPFSService` provides comprehensive storage solutions for NFT images and metadata using IPFS and Filecoin networks. It offers primary storage via IPFS (Pinata), backup storage via Filecoin (Lighthouse), multiple gateway redundancy, and availability monitoring.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)
- [Testing](#testing)

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @storacha/client lighthouse-web3 form-data axios
```

### 2. Environment Configuration

Create or update your `.env` file:

```bash
# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
IPFS_GATEWAY=https://gateway.pinata.cloud

# Filecoin Configuration (Lighthouse)
FILECOIN_API_KEY=your_lighthouse_api_key
FILECOIN_NETWORK=testnet  # or mainnet
```

### 3. Service Import

```typescript
import { ipfsService } from './src/services/ipfs.service';
```

## Configuration

### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PINATA_API_KEY` | Pinata API key for IPFS operations | Yes | - |
| `PINATA_SECRET_KEY` | Pinata secret key for IPFS operations | Yes | - |
| `IPFS_GATEWAY` | Primary IPFS gateway URL | No | `https://gateway.pinata.cloud` |
| `FILECOIN_API_KEY` | Lighthouse API key for Filecoin operations | No | - |
| `FILECOIN_NETWORK` | Filecoin network selection | No | `testnet` |

### Getting API Keys

#### Pinata (IPFS)
1. Visit [pinata.cloud](https://pinata.cloud)
2. Create account and verify email
3. Go to **API Keys** → **New Key**
4. Select **Pinning Services API**
5. Copy both API Key and API Secret

#### Lighthouse (Filecoin)
1. Visit [lighthouse.storage](https://lighthouse.storage)
2. Create account and verify email
3. Go to **Dashboard** → **API Keys**
4. Click **Generate New Key**
5. Copy the API key

## API Reference

### Constructor

```typescript
constructor()
```

Initializes the service with environment configuration.

**Logs:**
- Service initialization status
- Configuration validation
- Network selection

---

### uploadImage()

```typescript
async uploadImage(imageBuffer: Buffer, filename: string): Promise<string>
```

Uploads an image buffer to IPFS via Pinata.

**Parameters:**
- `imageBuffer` (Buffer): Raw image data
- `filename` (string): Name for the uploaded file

**Returns:**
- `Promise<string>`: IPFS URL of uploaded image

**Throws:**
- `Error`: When Pinata credentials are missing
- `Error`: When upload fails

**Example:**
```typescript
const buffer = fs.readFileSync('nft-image.png');
const url = await ipfsService.uploadImage(buffer, 'my-nft.png');
console.log('Image URL:', url);
// Output: https://gateway.pinata.cloud/ipfs/QmHash123...
```

**Logging:**
- Upload start with file size
- Progress tracking
- Success with hash and duration
- Error details on failure

---

### uploadMetadata()

```typescript
async uploadMetadata(metadata: any, name: string): Promise<string>
```

Uploads metadata JSON to IPFS via Pinata.

**Parameters:**
- `metadata` (any): Metadata object to upload
- `name` (string): Name identifier for the metadata

**Returns:**
- `Promise<string>`: IPFS URL of uploaded metadata

**Example:**
```typescript
const metadata = {
  name: 'My NFT',
  description: 'An awesome NFT',
  image: 'https://gateway.pinata.cloud/ipfs/QmImageHash',
  attributes: [
    { trait_type: 'Color', value: 'Blue' }
  ]
};

const url = await ipfsService.uploadMetadata(metadata, 'my-nft-metadata');
```

---

### uploadImageFromUrl()

```typescript
async uploadImageFromUrl(imageUrl: string, filename?: string): Promise<string>
```

Downloads an image from URL and uploads it to IPFS.

**Parameters:**
- `imageUrl` (string): URL of image to download
- `filename` (string, optional): Custom filename

**Returns:**
- `Promise<string>`: IPFS URL of uploaded image

**Example:**
```typescript
const ipfsUrl = await ipfsService.uploadImageFromUrl(
  'https://example.com/image.png',
  'downloaded-nft.png'
);
```

---

### uploadToFilecoin()

```typescript
async uploadToFilecoin(imageBuffer: Buffer, filename: string): Promise<{
  ipfsUrl: string;
  filecoinDealId?: string;
  cid: string;
  lighthouseUrl?: string;
}>
```

Uploads to both IPFS and Filecoin for redundancy.

**Parameters:**
- `imageBuffer` (Buffer): Raw image data
- `filename` (string): Name for the uploaded file

**Returns:**
- Object with multiple storage references

**Example:**
```typescript
const result = await ipfsService.uploadToFilecoin(buffer, 'nft.png');
console.log('IPFS URL:', result.ipfsUrl);
console.log('Filecoin Deal ID:', result.filecoinDealId);
console.log('CID:', result.cid);
```

**Fallback Behavior:**
- Falls back to IPFS-only if Filecoin API key missing
- Falls back to IPFS-only if Filecoin upload fails
- Always ensures content is available via IPFS

---

### checkFilecoinDealStatus()

```typescript
async checkFilecoinDealStatus(dealId: string): Promise<{
  status: 'pending' | 'active' | 'expired' | 'failed';
  cid?: string;
  replication?: number;
}>
```

Checks the status of a Filecoin storage deal.

**Parameters:**
- `dealId` (string): Deal ID to check

**Returns:**
- Deal status information

**Example:**
```typescript
const status = await ipfsService.checkFilecoinDealStatus('deal_12345');
if (status.status === 'active') {
  console.log('Deal is active with', status.replication, 'replicas');
}
```

---

### Utility Methods

#### isConfigured()

```typescript
isConfigured(): boolean
```

Checks if the service is properly configured with required credentials.

#### isIPFSUrl()

```typescript
isIPFSUrl(url: string): boolean
```

Determines if a URL is an IPFS URL.

#### extractCIDFromUrl()

```typescript
extractCIDFromUrl(ipfsUrl: string): string
```

Extracts the CID (Content Identifier) from an IPFS URL.

#### convertGateway()

```typescript
convertGateway(ipfsUrl: string, newGateway?: string): string
```

Converts an IPFS URL to use a different gateway.

#### getRedundantGateways()

```typescript
getRedundantGateways(ipfsHash: string): string[]
```

Returns multiple gateway URLs for the same content.

#### testIPFSAvailability()

```typescript
async testIPFSAvailability(ipfsHash: string): Promise<{
  available: boolean;
  workingGateways: string[];
  failedGateways: string[];
}>
```

Tests content availability across multiple IPFS gateways.

## Examples

### Basic NFT Upload Workflow

```typescript
async function createNFT(imageBuffer: Buffer, metadata: any) {
  try {
    // 1. Upload image to IPFS
    const imageUrl = await ipfsService.uploadImage(imageBuffer, 'nft.png');
    
    // 2. Add image URL to metadata
    metadata.image = imageUrl;
    
    // 3. Upload metadata to IPFS
    const metadataUrl = await ipfsService.uploadMetadata(metadata, 'nft-metadata');
    
    // 4. Use metadataUrl in your NFT minting
    return { imageUrl, metadataUrl };
  } catch (error) {
    console.error('NFT creation failed:', error);
    throw error;
  }
}
```

### High-Availability Upload with Filecoin

```typescript
async function uploadWithRedundancy(imageBuffer: Buffer, filename: string) {
  try {
    // Upload to both IPFS and Filecoin
    const result = await ipfsService.uploadToFilecoin(imageBuffer, filename);
    
    // Test availability across gateways
    const availability = await ipfsService.testIPFSAvailability(result.cid);
    
    console.log(`Uploaded successfully!`);
    console.log(`Available on ${availability.workingGateways.length} gateways`);
    
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### Gateway Redundancy Implementation

```typescript
async function getImageWithFallback(cid: string): Promise<string> {
  const gateways = ipfsService.getRedundantGateways(cid);
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(gateway, { method: 'HEAD' });
      if (response.ok) {
        return gateway; // Return first working gateway
      }
    } catch (error) {
      continue; // Try next gateway
    }
  }
  
  throw new Error('No working gateways found');
}
```

## Error Handling

### Common Error Types

```typescript
// Missing configuration
try {
  await ipfsService.uploadImage(buffer, 'test.png');
} catch (error) {
  if (error.message.includes('not configured')) {
    console.error('Please set PINATA_API_KEY and PINATA_SECRET_KEY');
  }
}

// Network/upload errors
try {
  await ipfsService.uploadToFilecoin(buffer, 'test.png');
} catch (error) {
  console.error('Upload failed, falling back to IPFS only');
  // Service automatically handles Filecoin fallback
}

// Deal status errors
try {
  const status = await ipfsService.checkFilecoinDealStatus('invalid_deal');
} catch (error) {
  console.error('Deal status check failed:', error);
  // Returns { status: 'failed' } instead of throwing
}
```

### Error Recovery Patterns

```typescript
async function robustUpload(imageBuffer: Buffer, filename: string) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      return await ipfsService.uploadImage(imageBuffer, filename);
    } catch (error) {
      attempts++;
      if (attempts === maxAttempts) throw error;
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }
}
```

## Best Practices

### 1. Configuration Validation

```typescript
// Check configuration before starting upload operations
if (!ipfsService.isConfigured()) {
  throw new Error('IPFS service not configured');
}
```

### 2. File Size Considerations

```typescript
// Check file size before upload
const maxSize = 10 * 1024 * 1024; // 10MB
if (imageBuffer.length > maxSize) {
  throw new Error('File too large');
}
```

### 3. Metadata Standards

```typescript
// Follow NFT metadata standards
const metadata = {
  name: 'NFT Name',
  description: 'NFT Description',
  image: ipfsUrl, // Always use IPFS URLs
  attributes: [
    { trait_type: 'Trait', value: 'Value' }
  ],
  created_at: new Date().toISOString()
};
```

### 4. Error Logging

```typescript
// Log errors with context for debugging
try {
  await ipfsService.uploadImage(buffer, filename);
} catch (error) {
  logger.error('Upload failed', {
    filename,
    size: buffer.length,
    error: error.message
  });
}
```

### 5. Gateway Redundancy

```typescript
// Always provide multiple gateway options to users
const cid = ipfsService.extractCIDFromUrl(ipfsUrl);
const backupGateways = ipfsService.getRedundantGateways(cid);

// Store backup URLs in database for resilience
await database.nft.update(id, {
  primaryImageUrl: ipfsUrl,
  backupImageUrls: backupGateways
});
```

## Testing

### Run Test Suite

```bash
# Run comprehensive test suite
npm run test:ipfs

# Run Jest unit tests
npm test -- ipfs.service.test.ts
```

### Test Categories

1. **Configuration Tests**: Verify environment setup
2. **Upload Tests**: Test IPFS and Filecoin uploads
3. **Utility Tests**: Test URL parsing and gateway functions
4. **Error Handling Tests**: Test error scenarios
5. **Integration Tests**: Test end-to-end workflows

### Manual Testing

```typescript
// Quick configuration test
console.log('IPFS Configured:', ipfsService.isConfigured());

// Test with small file
const testBuffer = Buffer.from('test data');
const url = await ipfsService.uploadImage(testBuffer, 'test.txt');
console.log('Upload successful:', url);
```

## Monitoring & Maintenance

### Key Metrics to Monitor

- Upload success rate
- Average upload duration
- Gateway availability
- Filecoin deal success rate
- Error frequency by type

### Maintenance Tasks

- Regularly test gateway availability
- Monitor Pinata storage usage
- Check Filecoin deal status
- Update gateway list as needed
- Rotate API keys periodically

## Support & Troubleshooting

### Common Issues

1. **"Missing credentials" error**: Check environment variables
2. **"Upload timeout" error**: Check network connectivity
3. **"Gateway not responding"**: Use redundant gateways
4. **"Filecoin deal failed"**: Check API key and balance

### Debug Mode

Enable debug logging for detailed information:

```bash
LOG_LEVEL=debug npm run test:ipfs
```

This will show detailed logs for all operations including individual gateway tests and timing information.
