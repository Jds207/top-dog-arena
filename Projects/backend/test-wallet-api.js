const { TopDogArenaAPI, examples } = require('./ai-assistant-helper.ts');

async function testWalletFeatures() {
  console.log('🧪 Testing Top Dog Arena Wallet API Features\n');
  
  try {
    // Test 1: Basic connectivity
    console.log('1️⃣ Testing connectivity...');
    const status = await examples.testConnection();
    console.log('');
    
    // Test 2: Create and setup new wallet
    console.log('2️⃣ Creating new wallet...');
    const walletSetup = await examples.createAndSetupWallet();
    if (walletSetup.error) {
      console.log('❌ Error:', walletSetup.error);
    } else {
      console.log('✅ Wallet setup completed');
      console.log(`   Address: ${walletSetup.wallet?.address}`);
      console.log(`   Network: ${walletSetup.wallet?.network}`);
    }
    console.log('');
    
    // Test 3: Validate some addresses
    console.log('3️⃣ Testing address validation...');
    const api = new TopDogArenaAPI();
    
    const validAddress = 'rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b';
    const invalidAddress = 'invalid_address_test';
    
    const valid = await api.validateAddress(validAddress);
    const invalid = await api.validateAddress(invalidAddress);
    
    console.log(`✅ Valid address (${validAddress}): ${valid.data?.isValid}`);
    console.log(`❌ Invalid address (${invalidAddress}): ${invalid.data?.isValid}`);
    console.log('');
    
    // Test 4: Sync all balances
    console.log('4️⃣ Syncing all wallet balances...');
    const syncAll = await api.syncAllBalances();
    if (syncAll.success) {
      console.log(`📊 Sync Results: ${syncAll.data?.successCount}/${syncAll.data?.totalAccounts} successful`);
      syncAll.data?.results.forEach((wallet, index) => {
        if (wallet.success) {
          console.log(`   ${index + 1}. ✅ ${wallet.address.substring(0, 20)}...: ${wallet.balance}`);
        } else {
          console.log(`   ${index + 1}. ❌ ${wallet.address.substring(0, 20)}...: ${wallet.error}`);
        }
      });
    }
    console.log('');
    
    console.log('🎉 Wallet API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWalletFeatures();
