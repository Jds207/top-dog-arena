import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorResponse {
  success: boolean;
  error: string;
  message: string;
  stack?: string;
  timestamp: string;
  path: string;
}

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const isOperational = error instanceof AppError ? error.isOperational : false;
  
  // Log error
  logger.error(`❌ Error ${statusCode}: ${error.message}`, {
    error: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: error.message,
    message: statusCode >= 500 ? 'Internal server error' : error.message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: 'Route not found',
    message: `The requested route ${req.method} ${req.path} was not found`,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  res.status(404).json(errorResponse);
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
