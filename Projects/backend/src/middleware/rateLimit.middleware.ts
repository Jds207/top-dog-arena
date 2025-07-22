import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Strict rate limiter for NFT creation endpoints
 */
export const nftCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 NFT creation requests per hour
  message: {
    success: false,
    error: 'NFT creation rate limit exceeded',
    message: 'You can only create 10 NFTs per hour. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`NFT creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'NFT creation rate limit exceeded',
      message: 'You can only create 10 NFTs per hour. Please try again later.',
      retryAfter: '1 hour'
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for trusted IPs (if needed)
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip || '');
  }
});

/**
 * Batch operations rate limiter
 */
export const batchLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  max: 3, // limit each IP to 3 batch requests per hour
  message: {
    success: false,
    error: 'Batch operation rate limit exceeded',
    message: 'You can only perform 3 batch operations per hour. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Batch operation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Batch operation rate limit exceeded', 
      message: 'You can only perform 3 batch operations per hour. Please try again later.',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Read operations rate limiter (more lenient)
 */
export const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 read requests per 15 minutes
  message: {
    success: false,
    error: 'Read operation rate limit exceeded',
    message: 'Too many read requests. Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Read operation rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      error: 'Read operation rate limit exceeded',
      message: 'Too many read requests. Please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Export the main rate limiter for use in server
 */
export const rateLimiter = apiLimiter;
