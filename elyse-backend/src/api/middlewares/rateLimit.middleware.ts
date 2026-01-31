import rateLimit from 'express-rate-limit';
import { env } from '../../config/env.config';
import { RateLimitError } from '../../utils/errors/AppError';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, _next, options) => {
        throw new RateLimitError(options.message as string);
    },
});

/**
 * Auth endpoints rate limiter (stricter)
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true,
    handler: (_req, _res, _next, options) => {
        throw new RateLimitError(options.message as string);
    },
});

/**
 * Payment endpoints rate limiter
 */
export const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 payment requests per window
    message: 'Too many payment requests, please try again later',
    handler: (_req, _res, _next, options) => {
        throw new RateLimitError(options.message as string);
    },
});
