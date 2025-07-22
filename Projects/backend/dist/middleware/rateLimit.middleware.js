"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.readLimiter = exports.batchLimiter = exports.nftCreationLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const logger_1 = require("../utils/logger");
/**
 * General API rate limiter
 */
exports.apiLimiter = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
        logger_1.logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
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
exports.nftCreationLimiter = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
        logger_1.logger.warn(`NFT creation rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'NFT creation rate limit exceeded',
            message: 'You can only create 10 NFTs per hour. Please try again later.',
            retryAfter: '1 hour'
        });
    },
    skip: (req) => {
        // Skip rate limiting for trusted IPs (if needed)
        const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
        return trustedIPs.includes(req.ip || '');
    }
});
/**
 * Batch operations rate limiter
 */
exports.batchLimiter = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
        logger_1.logger.warn(`Batch operation rate limit exceeded for IP: ${req.ip}`);
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
exports.readLimiter = (0, express_rate_limit_1.default)({
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
    handler: (req, res) => {
        logger_1.logger.warn(`Read operation rate limit exceeded for IP: ${req.ip} on ${req.path}`);
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
exports.rateLimiter = exports.apiLimiter;
//# sourceMappingURL=rateLimit.middleware.js.map