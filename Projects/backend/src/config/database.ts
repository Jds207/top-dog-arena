import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase(): Promise<void> {
  try {
    // Skip database connection if no DATABASE_URL is provided
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
      throw new Error('DATABASE_URL not configured');
    }
    
    await prisma.$connect();
    logger.info('✅ Database connection established');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('✅ Database connection closed');
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
}

// Handle Prisma client cleanup
process.on('beforeExit', async () => {
  await disconnectDatabase();
});
