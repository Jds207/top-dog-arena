/**
 * General API rate limiter
 */
export declare const apiLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for NFT creation endpoints
 */
export declare const nftCreationLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Batch operations rate limiter
 */
export declare const batchLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Read operations rate limiter (more lenient)
 */
export declare const readLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Export the main rate limiter for use in server
 */
export declare const rateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=rateLimit.middleware.d.ts.map