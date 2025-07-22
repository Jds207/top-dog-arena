import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
/**
 * Generic validation middleware factory
 */
export declare const validate: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate request parameters
 */
export declare const validateParams: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Validate query parameters
 */
export declare const validateQuery: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map