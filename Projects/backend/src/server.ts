import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes
import nftRoutes from './routes/nft.routes';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { rateLimiter } from './middleware/rateLimit.middleware';
import { requestLogger, addRequestId } from './middleware/logger.middleware';

// Import services
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { initializeXRPL } from './services/xrpl.service';

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true
}));

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));
app.use(addRequestId);
app.use(requestLogger);

// Rate limiting - temporarily disabled for testing
// app.use(rateLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nft', nftRoutes);

// 404 handler
app.use('*', notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Create HTTP server
const server = createServer(app);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database connection (optional for now)
    try {
      await connectDatabase();
      logger.info('✅ Database connected successfully');
    } catch (error) {
      logger.warn('⚠️ Database connection failed, continuing without database:', error);
    }

    // Initialize XRPL connection (optional for now)
    try {
      await initializeXRPL();
      logger.info('✅ XRPL client initialized successfully');
    } catch (error) {
      logger.warn('⚠️ XRPL initialization failed, continuing without XRPL:', error);
    }

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Top Dog Arena Backend Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🌐 XRPL Network: ${process.env.XRPL_NETWORK}`);
      logger.info(`⚡ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
