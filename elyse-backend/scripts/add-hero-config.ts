import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('Running migration: Add config column to hero_sections...');

        await c.query(`
      ALTER TABLE hero_sections 
      ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;
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
