import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ctoForceLink() {
    try {
        console.log('🚀 CTO Strategic Linkage Started...');

        // THE TARGET: Link all orders from 'admin@dhanyalifestyle.com' 
        // to the active user account 'ksv1619aditya@gmail.com'
        // (Assuming these are test orders by the same user)

        const targetEmail = 'ksv1619aditya@gmail.com';
        const sourceEmail = 'admin@dhanyalifestyle.com';

        // 1. Get Target User ID
        const userRes = await pool.query('SELECT id FROM profiles WHERE email = $1', [targetEmail]);
        if (userRes.rows.length === 0) {
            console.error(`❌ Target profile ${targetEmail} not found!`);
            return;
        }
        const targetId = userRes.rows[0].id;
        console.log(`✅ Target ID found: ${targetId}`);

        // 2. Update orders
        const updateRes = await pool.query(`
            UPDATE orders 
            SET user_id = $1, customer_email = $2
            WHERE customer_email = $3 AND user_id IS NULL;
        `, [targetId, targetEmail, sourceEmail]);

        console.log(`✅ Force linked ${updateRes.rowCount} orders from ${sourceEmail} to ${targetEmail} (${targetId}).`);

        // 3. Verify
        const verifyRes = await pool.query('SELECT count(*) FROM orders WHERE user_id = $1', [targetId]);
        console.log(`📊 Final order count for ${targetEmail}: ${verifyRes.rows[0].count}`);

    } catch (error) {
        console.error('❌ Linkage failed:', error);
    } finally {
        await pool.end();
    }
}

ctoForceLink();
