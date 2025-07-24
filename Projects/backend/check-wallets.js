require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWallets() {
  try {
    console.log('🔍 Checking wallets...\n');
    
    // Check all accounts in database
    const accounts = await prisma.account.findMany({
      select: {
        address: true,
        network: true,
        isOwned: true,
        nickname: true,
        createdAt: true
      }
    });
    
    console.log(`📊 TOTAL ACCOUNTS IN DATABASE: ${accounts.length}`);
    
    accounts.forEach((account, index) => {
      console.log(`  ${index + 1}. Address: ${account.address}`);
      console.log(`     Network: ${account.network}`);
      console.log(`     Owned: ${account.isOwned}`);
      console.log(`     Nickname: ${account.nickname || 'None'}`);
      console.log(`     Created: ${account.createdAt}`);
      console.log('');
    });
    
    // Check current .env wallet
    const envWallet = process.env.XRPL_WALLET_SEED;
    console.log('🔧 CONFIGURED WALLET:');
    if (envWallet) {
      console.log(`   Seed: ${envWallet}`);
      console.log(`   Address: rwiYXAA45LAg6GuMVm67owGtZC3tknbf4b (from .env comment)`);
    } else {
      console.log('   No wallet configured in .env');
    }
    
  } catch (error) {
    console.error('❌ Error checking wallets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWallets();
