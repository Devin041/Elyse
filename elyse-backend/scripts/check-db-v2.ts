import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function checkSchema() {
    const client = await pool.connect();
    try {
        const tables = ['wishlists', 'wishlist_items', 'user_addresses'];
        for (const table of tables) {
            const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [table]);
            console.log(`\n--- ${table} ---`);
            console.table(res.rows);
        }
    } finally {
        client.release();
        await pool.end();
    }
}
checkSchema();
