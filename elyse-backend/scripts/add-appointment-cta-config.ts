import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('Running migration: Add config column to appointment_cta...');

        await c.query(`
      ALTER TABLE appointment_cta 
      ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT true;
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
