import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Generic validation middleware factory
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logger.warn('Validation failed:', errors);

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

    } catch (error) {
      logger.error('Validation middleware error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal validation error',
        message: 'Something went wrong during validation'
      });
      return;
    }
  };
};

/**
 * Validate request parameters
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logger.warn('Parameter validation failed:', errors);

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

    } catch (error) {
      logger.error('Parameter validation middleware error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal validation error',
        message: 'Something went wrong during parameter validation'
      });
      return;
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        logger.warn('Query validation failed:', errors);

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

    } catch (error) {
      logger.error('Query validation middleware error:', error);
      
      res.status(500).json({
        success: false,
        error: 'Internal validation error',
        message: 'Something went wrong during query validation'
      });
      return;
    }
  };
};
