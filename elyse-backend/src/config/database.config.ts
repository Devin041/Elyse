import { Pool, PoolClient } from 'pg';
import { env } from './env.config';
import logger from '../utils/logger';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: env.DATABASE_POOL_SIZE,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

// Pool error handling
pool.on('error', (err: Error) => {
    logger.error('Unexpected database error', { error: err });
});

pool.on('connect', () => {
    logger.debug('New database connection established');
});

// Query helper with logging
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        logger.debug('Database query executed', {
            query: text,
            duration: `${duration}ms`,
            rows: result.rowCount,
        });

        return result;
    } catch (error) {
        logger.error('Database query failed', {
            query: text,
            params,
            error,
        });
        throw error;
    }
};

// Transaction helper
export const transaction = async <T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        logger.error('Database health check failed', { error });
        return false;
    }
};

// Graceful shutdown
export const closeDatabasePool = async (): Promise<void> => {
    await pool.end();
    logger.info('Database connection pool closed');
};

export default pool;
