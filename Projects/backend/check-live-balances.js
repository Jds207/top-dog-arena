require('dotenv').config();
const { Client } = require('xrpl');

async function checkWalletBalances() {
  const client = new Client('wss://s.altnet.rippletest.net:51233');
  
  const wallets = [
    'rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b', // Original wallet
    'rsDfKpwz1fm5C2g3ehHutvS55EfqjXwmkD', // First generated wallet
    'rfte7uT4EAYL72cbLBeFFzuJpYKQD1QZC6'  // Second generated wallet
  ];

  try {
    await client.connect();
    console.log('🔗 Connected to XRPL testnet\n');

    for (const address of wallets) {
      try {
        const response = await client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        
        const balance = response.result.account_data.Balance;
        const xrpBalance = (parseInt(balance) / 1000000).toFixed(6);
        
        console.log(`💰 ${address}`);
        console.log(`   Balance: ${xrpBalance} XRP (${balance} drops)`);
        console.log(`   Status: Account exists and has funds`);
        
      } catch (error) {
        console.log(`❌ ${address}`);
        console.log(`   Status: Account not found or unfunded`);
        console.log(`   Reason: ${error.message}`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ XRPL connection error:', error);
  } finally {
    await client.disconnect();
  }
}

checkWalletBalances();
