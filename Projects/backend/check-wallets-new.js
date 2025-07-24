require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkNewWallets() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 Checking all wallets in database...\n');
    
    // Get all accounts
    const accounts = await prisma.account.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total accounts: ${accounts.length}\n`);
    
    accounts.forEach((account, index) => {
      console.log(`${index + 1}. Address: ${account.address}`);
      console.log(`   Network: ${account.network}`);
      console.log(`   Is Owned: ${account.isOwned}`);
      console.log(`   Created: ${account.createdAt.toISOString()}`);
      console.log(`   Balance: ${account.balanceXRP || 'Not synced'} XRP`);
      if (account.nickname) console.log(`   Nickname: ${account.nickname}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewWallets();
