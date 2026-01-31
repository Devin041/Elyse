import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('Running migration: Add config column to product_carousel and carousel_tabs...');

        await c.query(`
      ALTER TABLE product_carousel 
      ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;

      ALTER TABLE carousel_tabs
      ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#000000';
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
