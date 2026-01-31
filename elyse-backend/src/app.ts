import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.config';
import { errorHandler, notFoundHandler } from './api/middlewares/errorHandler.middleware';
import { requestLogger } from './api/middlewares/requestLogger.middleware';
import { generalLimiter } from './api/middlewares/rateLimit.middleware';
import logger from './utils/logger';
import { checkDatabaseHealth } from './config/database.config';
import { checkRedisHealth } from './config/redis.config';
import apiRoutes from './api/routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(
        cors({
            origin: [env.FRONTEND_URL, 'http://localhost:3002', 'http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Cookie parsing middleware
    app.use(cookieParser());

    // Response compression
    app.use(compression());

    // Request logging
    app.use(requestLogger);

    // API rate limiting
    app.use('/api', generalLimiter);

    // Health check endpoint
    app.get('/health', async (_req, res) => {
        const dbHealth = await checkDatabaseHealth();
        const redisHealth = await checkRedisHealth();

        const status = dbHealth && redisHealth ? 'ok' : 'degraded';
        const statusCode = status === 'ok' ? 200 : 503;

        res.status(statusCode).json({
            status,
            timestamp: new Date().toISOString(),
            services: {
                database: dbHealth ? 'connected' : 'disconnected',
                redis: redisHealth ? 'connected' : 'disconnected',
            },
            environment: env.NODE_ENV,
        });
    });

    // API routes
    app.use('/api/v1', apiRoutes);

    // 404 handler for undefined routes
    app.use(notFoundHandler);

    // Global error handler (must be last)
    app.use(errorHandler);

    logger.info('Express application configured', {
        environment: env.NODE_ENV,
        cors: env.FRONTEND_URL,
    });

    return app;
};

export default createApp();
