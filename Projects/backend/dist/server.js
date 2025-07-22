"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
// Load environment variables
dotenv_1.default.config();
// Import routes
const nft_routes_1 = __importDefault(require("./routes/nft.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
// Import middleware
const error_middleware_1 = require("./middleware/error.middleware");
const logger_middleware_1 = require("./middleware/logger.middleware");
// Import services
const logger_1 = require("./utils/logger");
const database_1 = require("./config/database");
const xrpl_service_1 = require("./services/xrpl.service");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true
}));
// Request parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging middleware
app.use((0, morgan_1.default)('combined'));
app.use(logger_middleware_1.addRequestId);
app.use(logger_middleware_1.requestLogger);
// Rate limiting - temporarily disabled for testing
// app.use(rateLimiter);
// API Routes
app.use('/api/health', health_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.use('/api/nft', nft_routes_1.default);
// 404 handler
app.use('*', error_middleware_1.notFoundHandler);
// Error handling middleware (must be last)
app.use(error_middleware_1.errorHandler);
// Create HTTP server
const server = (0, http_1.createServer)(app);
// Graceful shutdown handling
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        logger_1.logger.info('Process terminated');
        process.exit(0);
    });
});
// Start server
async function startServer() {
    try {
        // Initialize database connection (optional for now)
        try {
            await (0, database_1.connectDatabase)();
            logger_1.logger.info('✅ Database connected successfully');
        }
        catch (error) {
            logger_1.logger.warn('⚠️ Database connection failed, continuing without database:', error);
        }
        // Initialize XRPL connection (optional for now)
        try {
            await (0, xrpl_service_1.initializeXRPL)();
            logger_1.logger.info('✅ XRPL client initialized successfully');
        }
        catch (error) {
            logger_1.logger.warn('⚠️ XRPL initialization failed, continuing without XRPL:', error);
        }
        // Start HTTP server
        server.listen(PORT, () => {
            logger_1.logger.info(`🚀 Top Dog Arena Backend Server running on port ${PORT}`);
            logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 XRPL Network: ${process.env.XRPL_NETWORK}`);
            logger_1.logger.info(`⚡ Health check: http://localhost:${PORT}/api/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start the server
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map