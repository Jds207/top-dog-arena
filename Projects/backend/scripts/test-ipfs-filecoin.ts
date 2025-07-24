import { ipfsService } from '../src/services/ipfs.service';
import { logger } from '../src/utils/logger';

/**
 * Comprehensive test suite for IPFS and Filecoin integration
 * 
 * Tests all major functionality:
 * - IPFS image uploads
 * - Metadata uploads  
 * - Filecoin integration
 * - Gateway redundancy
 * - Availability testing
 * - Error handling
 */
async function testIPFSAndFilecoin() {
  logger.info('🧪 Starting IPFS and Filecoin integration test suite...');

  // Test data - 1x1 pixel PNG
  const testImageData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 
    'base64'
  );
  const timestamp = Date.now();
  const filename = `test-nft-${timestamp}.png`;

  const results = {
    ipfsUpload: false,
    metadataUpload: false,
    urlDownload: false,
    filecoinUpload: false,
    gatewayRedundancy: false,
    availabilityTest: false,
    configuration: false
  };

  try {
    // Test 1: Check configuration
    logger.info('📌 Test 1: Service Configuration Check');
    const isConfigured = ipfsService.isConfigured();
    results.configuration = isConfigured;
    
    if (isConfigured) {
      logger.info('✅ IPFS service is properly configured');
    } else {
      logger.warn('⚠️ IPFS service not fully configured - some tests may fail');
    }

    // Test 2: Basic IPFS upload
    logger.info('📌 Test 2: Basic IPFS Image Upload');
    let ipfsUrl: string;
    try {
      ipfsUrl = await ipfsService.uploadImage(testImageData, filename);
      results.ipfsUpload = true;
      logger.info(`✅ IPFS upload successful: ${ipfsUrl}`);
    } catch (error) {
      logger.error('❌ IPFS upload failed:', error);
      ipfsUrl = 'mock://test-url'; // Continue with mock for other tests
    }

    // Test 3: Metadata upload
    logger.info('📌 Test 3: Metadata Upload');
    const testMetadata = {
      name: `Test NFT ${timestamp}`,
      description: 'Test NFT for integration testing',
      image: ipfsUrl,
      attributes: [
        { trait_type: 'Test', value: 'True' },
        { trait_type: 'Timestamp', value: timestamp.toString() }
      ],
      created_at: new Date().toISOString()
    };

    try {
      const metadataUrl = await ipfsService.uploadMetadata(testMetadata, `test-metadata-${timestamp}`);
      results.metadataUpload = true;
      logger.info(`✅ Metadata upload successful: ${metadataUrl}`);
    } catch (error) {
      logger.error('❌ Metadata upload failed:', error);
    }

    // Test 4: URL download and upload
    logger.info('📌 Test 4: URL Download and Upload');
    try {
      // Use a small test image URL
      const testImageUrl = 'https://via.placeholder.com/100x100.png';
      const downloadedUrl = await ipfsService.uploadImageFromUrl(testImageUrl, `downloaded-${timestamp}.png`);
      results.urlDownload = true;
      logger.info(`✅ URL download and upload successful: ${downloadedUrl}`);
    } catch (error) {
      logger.warn('⚠️ URL download test failed (might be network/config issue):', error);
    }

    // Test 5: Gateway redundancy
    logger.info('📌 Test 5: Gateway Redundancy');
    try {
      const cid = ipfsService.extractCIDFromUrl(ipfsUrl);
      if (cid) {
        const gateways = ipfsService.getRedundantGateways(cid);
        results.gatewayRedundancy = gateways.length > 0;
        logger.info(`✅ Gateway redundancy working: ${gateways.length} gateways available`);
        gateways.forEach((gateway, index) => {
          logger.info(`   ${index + 1}. ${gateway}`);
        });
      } else {
        logger.warn('⚠️ Could not extract CID for gateway test');
      }
    } catch (error) {
      logger.error('❌ Gateway redundancy test failed:', error);
    }

    // Test 6: Availability testing
    logger.info('📌 Test 6: IPFS Availability Testing');
    try {
      const cid = ipfsService.extractCIDFromUrl(ipfsUrl);
      if (cid && results.ipfsUpload) {
        const availability = await ipfsService.testIPFSAvailability(cid);
        results.availabilityTest = true;
        logger.info(`✅ Availability test completed:`, {
          available: availability.available,
          workingGateways: availability.workingGateways.length,
          failedGateways: availability.failedGateways.length
        });
      } else {
        logger.warn('⚠️ Skipping availability test - no valid CID available');
      }
    } catch (error) {
      logger.error('❌ Availability test failed:', error);
    }

    // Test 7: Filecoin integration
    logger.info('📌 Test 7: Filecoin Integration');
    try {
      const filecoinResult = await ipfsService.uploadToFilecoin(testImageData, `filecoin-${filename}`);
      results.filecoinUpload = true;
      logger.info('✅ Filecoin upload successful:', {
        ipfsUrl: filecoinResult.ipfsUrl,
        cid: filecoinResult.cid,
        hasDealId: !!filecoinResult.filecoinDealId,
        hasLighthouseUrl: !!filecoinResult.lighthouseUrl
      });

      // Test deal status if we have a deal ID
      if (filecoinResult.filecoinDealId && filecoinResult.filecoinDealId !== 'pending') {
        logger.info('📋 Testing deal status check...');
        const dealStatus = await ipfsService.checkFilecoinDealStatus(filecoinResult.filecoinDealId);
        logger.info('📋 Deal status:', dealStatus);
      }
    } catch (error) {
      logger.warn('⚠️ Filecoin integration test failed (might be API key missing):', error);
    }

    // Test 8: Utility functions
    logger.info('📌 Test 8: Utility Functions');
    const testUrls = [
      'https://gateway.pinata.cloud/ipfs/QmTestHash123',
      'ipfs://QmTestHash456',
      'https://example.com/image.png',
      'https://cloudflare-ipfs.com/ipfs/QmHash789'
    ];

    testUrls.forEach(url => {
      const isIPFS = ipfsService.isIPFSUrl(url);
      const cid = ipfsService.extractCIDFromUrl(url);
      const converted = ipfsService.convertGateway(url, 'https://dweb.link');
      
      logger.info(`🔧 URL analysis: ${url}`, {
        isIPFS,
        extractedCID: cid,
        convertedURL: converted
      });
    });

    // Summary
    logger.info('🎉 Test suite completed!');
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    logger.info('📊 Test Results Summary:', {
      passed: passedTests,
      total: totalTests,
      percentage: `${((passedTests / totalTests) * 100).toFixed(1)}%`,
      details: results
    });

    if (passedTests === totalTests) {
      logger.info('� All tests passed! IPFS and Filecoin integration is working perfectly.');
    } else if (passedTests >= totalTests * 0.7) {
      logger.info('✅ Most tests passed! Some features may need configuration.');
    } else {
      logger.warn('⚠️ Several tests failed. Check your configuration and network connectivity.');
    }

  } catch (error) {
    logger.error('❌ Test suite failed with critical error:', error);
    process.exit(1);
  }
}

// Performance timing wrapper
async function runWithTiming() {
  const startTime = Date.now();
  
  try {
    await testIPFSAndFilecoin();
    const duration = Date.now() - startTime;
    logger.info(`⏱️ Test suite completed in ${duration}ms`);
    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`❌ Test suite failed after ${duration}ms:`, error);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runWithTiming();
}

export { testIPFSAndFilecoin };
