import { Request, Response, NextFunction } from 'express';
/**
 * Request logging middleware
 */
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Add request ID to responses
 */
export declare const addRequestId: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=logger.middleware.d.ts.map