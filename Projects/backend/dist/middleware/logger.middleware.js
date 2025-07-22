"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRequestId = exports.requestLogger = void 0;
const logger_1 = require("../utils/logger");
/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.json;
    // Override res.json to capture response data
    res.json = function (data) {
        const duration = Date.now() - start;
        // Log request details
        logger_1.logger.info(`${req.method} ${req.path}`, {
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
exports.requestLogger = requestLogger;
/**
 * Add request ID to responses
 */
const addRequestId = (req, res, next) => {
    const requestId = generateRequestId();
    res.setHeader('X-Request-ID', requestId);
    next();
};
exports.addRequestId = addRequestId;
/**
 * Generate unique request ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=logger.middleware.js.map