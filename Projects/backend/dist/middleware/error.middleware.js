"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Global error handler middleware
 */
const errorHandler = (error, req, res, next) => {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const isOperational = error instanceof AppError ? error.isOperational : false;
    // Log error
    logger_1.logger.error(`❌ Error ${statusCode}: ${error.message}`, {
        error: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Prepare error response
    const errorResponse = {
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
exports.errorHandler = errorHandler;
/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res) => {
    const errorResponse = {
        success: false,
        error: 'Route not found',
        message: `The requested route ${req.method} ${req.path} was not found`,
        timestamp: new Date().toISOString(),
        path: req.path
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Async error wrapper to catch async errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error.middleware.js.map