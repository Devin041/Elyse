import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('Running migration: Add link and slug to occasion_categories...');

        await c.query(`
      ALTER TABLE occasion_categories 
      ADD COLUMN IF NOT EXISTS link TEXT,
      ADD COLUMN IF NOT EXISTS slug TEXT;
    `);

        console.log('✅ Migration successful');
    } catch (e: any) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}

run();
