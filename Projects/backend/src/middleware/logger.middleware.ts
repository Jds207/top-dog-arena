import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const originalSend = res.json;

  // Override res.json to capture response data
  res.json = function(data: any) {
    const duration = Date.now() - start;
    
    // Log request details
    logger.info(`${req.method} ${req.path}`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      contentLength: res.get('Content-Length'),
      requestId: res.get('X-Request-ID')
    });

    // Call original json method
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Add request ID to responses
 */
export const addRequestId = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = generateRequestId();
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
