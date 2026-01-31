import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function checkSchema() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('wishlists', 'wishlist_items')
            ORDER BY table_name, ordinal_position
        `);
        console.table(res.rows);
    } finally {
        client.release();
        await pool.end();
    }
}
checkSchema();
