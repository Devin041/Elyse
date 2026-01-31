import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        const res = await c.query('SELECT count(*) FROM product_variants');
        console.log('Variants count:', res.rows[0].count);
    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
