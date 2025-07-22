"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validate = void 0;
const logger_1 = require("../utils/logger");
/**
 * Generic validation middleware factory
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body);
            if (!result.success) {
                const errors = result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                logger_1.logger.warn('Validation failed:', errors);
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    message: 'Invalid request data',
                    details: errors
                });
                return;
            }
            // Replace request body with validated data
            req.body = result.data;
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal validation error',
                message: 'Something went wrong during validation'
            });
            return;
        }
    };
};
exports.validate = validate;
/**
 * Validate request parameters
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.params);
            if (!result.success) {
                const errors = result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                logger_1.logger.warn('Parameter validation failed:', errors);
                res.status(400).json({
                    success: false,
                    error: 'Invalid parameters',
                    message: 'Request parameters are invalid',
                    details: errors
                });
                return;
            }
            // Replace request params with validated data
            req.params = result.data;
            next();
        }
        catch (error) {
            logger_1.logger.error('Parameter validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal validation error',
                message: 'Something went wrong during parameter validation'
            });
            return;
        }
    };
};
exports.validateParams = validateParams;
/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.query);
            if (!result.success) {
                const errors = result.error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                logger_1.logger.warn('Query validation failed:', errors);
                res.status(400).json({
                    success: false,
                    error: 'Invalid query parameters',
                    message: 'Query parameters are invalid',
                    details: errors
                });
                return;
            }
            // Replace request query with validated data
            req.query = result.data;
            next();
        }
        catch (error) {
            logger_1.logger.error('Query validation middleware error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal validation error',
                message: 'Something went wrong during query validation'
            });
            return;
        }
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.middleware.js.map