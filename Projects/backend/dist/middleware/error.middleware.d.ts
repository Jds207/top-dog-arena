import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number, isOperational?: boolean);
}
/**
 * Global error handler middleware
 */
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
/**
 * Handle 404 errors
 */
export declare const notFoundHandler: (req: Request, res: Response) => void;
/**
 * Async error wrapper to catch async errors
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map