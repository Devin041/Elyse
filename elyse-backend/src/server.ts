import { createApp } from './app';
import { env } from './config/env.config';
import logger from './utils/logger';
import { closeDatabasePool } from './config/database.config';
import { closeRedisConnection } from './config/redis.config';

const app = createApp();

/**
 * Start the server
 */
const server = app.listen(env.PORT, () => {
    logger.info(`Server started`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
    });

    logger.info(`Health check: http://localhost:${env.PORT}/health`);
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
        logger.info('HTTP server closed');

        try {
            // Close database connections
            await closeDatabasePool();

            // Close Redis connection
            await closeRedisConnection();

            logger.info('✅ Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            logger.error('Error during graceful shutdown', { error });
            process.exit(1);
        }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    process.exit(1);
});
