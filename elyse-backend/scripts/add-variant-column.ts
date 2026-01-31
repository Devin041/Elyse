import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('🔄 Adding is_available column to product_variants...\n');

        await c.query(`
      ALTER TABLE product_variants 
      ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
    `);

        console.log('✅ Column added successfully!');

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
