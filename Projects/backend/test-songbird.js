#!/usr/bin/env node

// Simple test script to verify Songbird integration is properly set up
const { songbirdService } = require('./dist/services/songbird.service.js');

async function testSongbirdIntegration() {
  console.log('🧪 Testing Songbird Integration...\n');

  try {
    // Test connection status
    console.log('1️⃣ Testing connection status...');
    const status = await songbirdService.getConnectionStatus();
    console.log('   Status:', status);

    if (status.success) {
      console.log('   ✅ Connection successful');
    } else {
      console.log('   ❌ Connection failed:', status.error);
    }

    // Test gas estimation
    console.log('\n2️⃣ Testing gas estimation...');
    try {
      const gasEstimate = await songbirdService.getGasEstimate('wrap');
      console.log('   Gas estimate for wrap:', gasEstimate);
      console.log('   ✅ Gas estimation working');
    } catch (error) {
      console.log('   ⚠️ Gas estimation failed:', error.message);
    }

    console.log('\n🎉 Songbird integration test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSongbirdIntegration();
}

module.exports = { testSongbirdIntegration };
