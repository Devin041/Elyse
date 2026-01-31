import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors/AppError';
import { env } from '../../config/env.config';
import logger from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Global error handler middleware
 * Handles all errors thrown in the application
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const requestId = (req as any).requestId || uuidv4();

    // Default error response
    let statusCode = 500;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';
    let details: any = undefined;

    // Handle known AppError instances
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        code = err.code;
        message = err.message;

        if ('details' in err) {
            details = err.details;
        }

        // Log operational errors as warnings
        logger.warn('Application error', {
            requestId,
            code,
            message,
            path: req.path,
            method: req.method,
            statusCode,
        });
    } else {
        // Log unexpected errors as errors
        logger.error('Unexpected error', {
            requestId,
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }

    // Send error response
    const errorResponse: any = {
        success: false,
        error: {
            code,
            message,
            ...(details && { details }),
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId,
        },
    };

    // Include stack trace in development
    if (env.NODE_ENV === 'development') {
        errorResponse.error.stack = err.stack;
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();

    logger.warn('Route not found', {
        requestId,
        path: req.path,
        method: req.method,
    });

    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`,
        },
        meta: {
            timestamp: new Date().toISOString(),
            requestId,
        },
    });
};
