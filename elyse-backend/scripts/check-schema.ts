import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('🔍 Checking schema...\n');

        const res = await c.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'product_variants'
        ORDER BY column_name
    `);

        console.table(res.rows);

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
