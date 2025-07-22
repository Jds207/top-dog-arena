"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
exports.prisma = new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
async function connectDatabase() {
    try {
        // Skip database connection if no DATABASE_URL is provided
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('username:password')) {
            throw new Error('DATABASE_URL not configured');
        }
        await exports.prisma.$connect();
        logger_1.logger.info('✅ Database connection established');
    }
    catch (error) {
        logger_1.logger.error('❌ Database connection failed:', error);
        throw error;
    }
}
async function disconnectDatabase() {
    try {
        await exports.prisma.$disconnect();
        logger_1.logger.info('✅ Database connection closed');
    }
    catch (error) {
        logger_1.logger.error('❌ Error closing database connection:', error);
        throw error;
    }
}
// Handle Prisma client cleanup
process.on('beforeExit', async () => {
    await disconnectDatabase();
});
//# sourceMappingURL=database.js.map