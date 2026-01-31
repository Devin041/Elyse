import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.development
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });


// Define environment schema with strict validation
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.string().default('3001'),

    // Database
    DATABASE_URL: z.string().url('Invalid database URL'),
    DATABASE_POOL_SIZE: z.string().default('20').transform(Number),

    // Redis
    REDIS_URL: z.string().url('Invalid Redis URL'),

    // JWT
    JWT_ACCESS_SECRET: z.string().min(32, 'JWT access secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // CORS
    FRONTEND_URL: z.string().url('Invalid frontend URL'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

    // Cloudinary
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
});

// Parse and validate environment variables
let env: z.infer<typeof envSchema>;

try {
    env = envSchema.parse(process.env);
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Environment validation failed:');
        error.issues.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }
    throw error;
}

export { env };
export type Env = z.infer<typeof envSchema>;
