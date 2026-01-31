import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function ctoVerify(targetId: string) {
    try {
        console.log(`--- CTO DIAGNOSTIC FOR USER ID: ${targetId} ---`);

        // 1. Check Profiles
        const pRes = await pool.query('SELECT * FROM profiles WHERE id = $1', [targetId]);
        console.log('Profile found:', pRes.rows.length > 0 ? 'YES' : 'NO');
        if (pRes.rows.length > 0) console.table(pRes.rows);

        // 2. Check Orders by user_id
        const oIdRes = await pool.query('SELECT id, order_number, user_id, customer_email, order_status FROM orders WHERE user_id = $1', [targetId]);
        console.log(`Orders found by user_id (${targetId}):`, oIdRes.rows.length);
        if (oIdRes.rows.length > 0) console.table(oIdRes.rows);

        if (pRes.rows.length > 0) {
            const email = pRes.rows[0].email;
            // 3. Check Orders by email (in case they aren't linked by user_id yet)
            const oEmailRes = await pool.query('SELECT id, order_number, user_id, customer_email, order_status FROM orders WHERE customer_email = $1', [email]);
            console.log(`Orders found by email (${email}):`, oEmailRes.rows.length);
            if (oEmailRes.rows.length > 0) console.table(oEmailRes.rows);

            // 4. Verify auth.users
            const authRes = await pool.query('SELECT id, email FROM auth.users WHERE id = $1', [targetId]);
            console.log('Auth user found:', authRes.rows.length > 0 ? 'YES' : 'NO');
            if (authRes.rows.length > 0) console.table(authRes.rows);
        }

    } catch (error) {
        console.error('Diagnostic error:', error);
    } finally {
        await pool.end();
    }
}

const userId = 'baeae391-ebb7-4921-a381-bc97e970e508';
ctoVerify(userId);
