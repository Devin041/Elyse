import Redis from 'ioredis';
import { env } from './env.config';
import logger from '../utils/logger';

// Create Redis client (Lazy initialization or check for placeholder)
const isRedisPlaceholder = env.REDIS_URL.includes('placeholder');

const redis = isRedisPlaceholder
    ? {
        on: () => { },
        get: async () => null,
        setex: async () => { },
        del: async () => { },
        keys: async () => [],
        exists: async () => 0,
        ping: async () => 'PONG',
        quit: async () => { },
    } as any
    : new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        },
        reconnectOnError(err) {
            logger.error('Redis connection error', { error: err });
            return true;
        },
    });

if (isRedisPlaceholder) {
    logger.warn('⚠️ Redis is running with placeholder configuration - caching is disabled');
}

// Redis event handlers
redis.on('connect', () => {
    logger.info('Redis connected');
});

redis.on('ready', () => {
    logger.info('Redis ready to accept commands');
});

redis.on('error', (err) => {
    logger.error('Redis error', { error: err });
});

redis.on('close', () => {
    logger.warn('Redis connection closed');
});

// Cache helper class
export class CacheService {
    /**
     * Get value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await redis.get(key);
            if (!value) return null;
            return JSON.parse(value) as T;
        } catch (error) {
            logger.error('Cache get error', { key, error });
            return null;
        }
    }

    /**
     * Set value in cache with TTL (in seconds)
     */
    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            logger.error('Cache set error', { key, error });
        }
    }

    /**
     * Delete key from cache
     */
    async delete(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            logger.error('Cache delete error', { key, error });
        }
    }

    /**
     * Delete multiple keys matching pattern
     */
    async deletePattern(pattern: string): Promise<void> {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            logger.error('Cache delete pattern error', { pattern, error });
        }
    }

    /**
     * Check if key exists
     */
    async exists(key: string): Promise<boolean> {
        try {
            const result = await redis.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Cache exists error', { key, error });
            return false;
        }
    }
}

// Check Redis health
export const checkRedisHealth = async (): Promise<boolean> => {
    try {
        await redis.ping();
        return true;
    } catch (error) {
        logger.error('Redis health check failed', { error });
        return false;
    }
};

// Graceful shutdown
export const closeRedisConnection = async (): Promise<void> => {
    await redis.quit();
    logger.info('Redis connection closed');
};

export const cache = new CacheService();
export default redis;
