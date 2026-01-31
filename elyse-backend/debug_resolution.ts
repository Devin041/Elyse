import { resolve } from 'path';

const files = [
    './src/app',
    './src/config/env.config',
    './src/utils/logger',
    './src/config/database.config',
    './src/config/redis.config',
    './src/api/routes',
    './src/api/routes/inquiry.routes',
    './src/api/validators/inquiry.validator',
    './src/api/services/inquiry.service',
    './src/api/middlewares/validate.middleware',
    'express',
    'pg',
    'ioredis',
    'winston',
    'dotenv',
    'zod'
];

console.log('--- RESOLUTION TEST ---');
for (const file of files) {
    try {
        const path = require.resolve(file, { paths: [process.cwd()] });
        console.log(`✅ ${file} -> ${path}`);
    } catch (e: any) {
        console.log(`❌ ${file} FAILED: ${e.message}`);
    }
}
