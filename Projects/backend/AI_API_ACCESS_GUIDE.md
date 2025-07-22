# Top Dog Arena API - AI Assistant Access Guide

## Quick API Access Summary
- **Server URL**: `http://localhost:3004`
- **API Base**: `http://localhost:3004/api`
- **OpenAPI Spec (JSON)**: `http://localhost:3004/openapi.json`
- **OpenAPI Spec (YAML)**: `http://localhost:3004/openapi.yaml`
- **Interactive Docs**: `http://localhost:3004/api-docs`

## For AI Assistants - How to Access the API

### 1. Get the OpenAPI Specification

**Method 1: JSON Format (Recommended for APIs)**
```bash
curl -X GET "http://localhost:3004/openapi.json"
```

**Method 2: YAML Format**
```bash
curl -X GET "http://localhost:3004/openapi.yaml"
```

**PowerShell (Windows)**
```powershell
Invoke-RestMethod -Uri "http://localhost:3004/openapi.json"
```

### 2. Test API Health

```bash
curl -X GET "http://localhost:3004/api/health"
```

**Response:**
```json
{
  "success": true,
  "message": "Top Dog Arena API is running",
  "timestamp": "2025-01-21T03:57:45.123Z",
  "version": "1.0.0"
}
```

### 3. Available Endpoints for AI Testing

#### Health Endpoints
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status
- `GET /api/health/xrpl` - XRPL connection status

#### NFT Endpoints (Currently in "not configured" state)
- `POST /api/nft/create` - Create single NFT
- `POST /api/nft/batch-create` - Create multiple NFTs
- `GET /api/nft/{nftId}` - Get NFT by ID
- `GET /api/nft/account/{account}` - Get NFTs by account
- `GET /api/nft/wallet/info` - Get wallet information

### 4. Example API Calls

#### Create NFT (POST)
```bash
curl -X POST "http://localhost:3004/api/nft/create" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Top Dog Card #001",
    "description": "Baseball card for Top Dog Arena",
    "imageUrl": "https://example.com/card.jpg",
    "attributes": [
      {"trait_type": "Player", "value": "Mike Johnson"},
      {"trait_type": "Position", "value": "Pitcher"}
    ]
  }'
```

#### Get Account NFTs (GET)
```bash
curl -X GET "http://localhost:3004/api/nft/account/rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH"
```

### 5. Response Format

All endpoints return JSON with consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly error message",
  "timestamp": "2025-01-21T03:57:45.123Z"
}
```

### 6. Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **NFT Creation**: 10 requests per hour per IP
- **Batch Operations**: 3 requests per hour per IP
- **Read Operations**: 200 requests per 15 minutes per IP

### 7. Current Status

⚠️ **XRPL Configuration Required**: The API is running but XRPL wallet is not configured. NFT operations will return:
```json
{
  "success": false,
  "error": "XRPL wallet not configured",
  "message": "Please configure XRPL_WALLET_SEED environment variable"
}
```

### 8. For AI Development Tools

The API provides full OpenAPI 3.0 specification that can be imported into:
- **Postman**: Import from `http://localhost:3004/openapi.json`
- **Insomnia**: Import OpenAPI spec
- **AI Assistants**: Use the JSON spec for automatic endpoint discovery
- **Code Generation**: Generate client SDKs from the OpenAPI spec

### 9. Interactive Testing

Visit `http://localhost:3004/api-docs` for a full Swagger UI interface where you can:
- View all endpoints
- Test API calls directly from the browser
- See request/response schemas
- Try different parameters

## Summary for AI Assistants

1. **Get the spec**: `curl http://localhost:3004/openapi.json`
2. **Test connectivity**: `curl http://localhost:3004/api/health`
3. **Try NFT endpoints**: Use the examples above (expect "not configured" responses currently)
4. **Full documentation**: Browse `http://localhost:3004/api-docs`

The API is fully functional and ready for AI assistant integration!
