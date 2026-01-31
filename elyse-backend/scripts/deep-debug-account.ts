import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function debugAccountData() {
    try {
        // 1. Check all users to find the one we are likely logged in as
        const usersRes = await pool.query('SELECT id, email, full_name, role FROM users ORDER BY created_at DESC LIMIT 10');
        console.log('--- Recent Users ---');
        console.table(usersRes.rows);

        // 2. Check for orders and see their user_ids
        const ordersRes = await pool.query('SELECT id, order_number, user_id, customer_email, order_status FROM orders ORDER BY created_at DESC LIMIT 10');
        console.log('\n--- Recent Orders ---');
        console.table(ordersRes.rows);

        // 3. Check for wishlist items
        const wishlistRes = await pool.query('SELECT * FROM wishlist_items LIMIT 5');
        console.log('\n--- Wishlist Items (Sample) ---');
        console.table(wishlistRes.rows);

    } catch (error) {
        console.error('Debug failed:', error);
    } finally {
        await pool.end();
    }
}

debugAccountData();
