import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function debugAccountData() {
    try {
        // 1. Check all users
        const usersRes = await pool.query('SELECT id, email FROM users ORDER BY created_at DESC LIMIT 10');
        console.log('--- Recent Users ---');
        console.table(usersRes.rows);

        // 2. Check for orders and see their user_ids
        const ordersRes = await pool.query('SELECT o.id, o.order_number, o.user_id, o.customer_email, o.order_status, u.email as linked_user_email FROM orders o LEFT JOIN users u ON u.user_id = o.user_id ORDER BY o.created_at DESC LIMIT 10');
        console.log('\n--- Recent Orders ---');
        console.table(ordersRes.rows);

        // 3. Search for the specific email mentioned by the user if possible
        const userEmail = 'admin@dhanyalifestyle.com';
        const specificUserRes = await pool.query('SELECT id, email FROM users WHERE email = $1', [userEmail]);
        console.log(`\n--- Searching for user with email ${userEmail} ---`);
        console.table(specificUserRes.rows);

        const specificOrdersRes = await pool.query('SELECT id, order_number, user_id, customer_email FROM orders WHERE customer_email = $1', [userEmail]);
        console.log(`\n--- Searching for orders with customer_email ${userEmail} ---`);
        console.table(specificOrdersRes.rows);

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await pool.end();
    }
}

debugAccountData();
