import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkUnlinkedOrders() {
    try {
        console.log('--- UNLINKED ORDERS ---');
        const res = await pool.query('SELECT id, order_number, customer_email, user_id, order_status FROM orders WHERE user_id IS NULL');
        console.table(res.rows);

        console.log('\n--- MATCHING PROFILES ---');
        for (const row of res.rows) {
            const pRes = await pool.query('SELECT id, email FROM profiles WHERE email ILIKE $1', [row.customer_email]);
            if (pRes.rows.length > 0) {
                console.log(`Found profile for ${row.customer_email}:`, pRes.rows[0].id);
            } else {
                console.log(`NO profile found for ${row.customer_email}`);
            }
        }

    } catch (error) {
        console.error('Check failed:', error);
    } finally {
        await pool.end();
    }
}

checkUnlinkedOrders();
