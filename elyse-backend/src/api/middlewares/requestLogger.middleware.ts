import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';

/**
 * Request logging middleware
 * Adds request ID and logs all incoming requests
 */
export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
    // Generate unique request ID
    const requestId = uuidv4();
    (req as any).requestId = requestId;

    // Log incoming request
    logger.info('Incoming request', {
        requestId,
        method: req.method,
        path: req.path,
        query: req.query,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });

    // Log response when finished
    const startTime = Date.now();
    _res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info('Request completed', {
            requestId,
            method: req.method,
            path: req.path,
            statusCode: _res.statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};
