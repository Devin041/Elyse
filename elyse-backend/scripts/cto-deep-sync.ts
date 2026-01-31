import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function deepSync() {
    try {
        console.log('🚀 CTO Deep Sync Started...');

        // 1. Sync all auth users to profiles
        const syncRes = await pool.query(`
            INSERT INTO public.profiles (id, email, updated_at)
            SELECT id, email, NOW() FROM auth.users
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW()
            RETURNING id, email;
        `);
        console.log(`✅ Synced ${syncRes.rowCount} profiles.`);

        // 2. Link ALL orders that have matching emails but NULL user_id
        // Case-insensitive match
        const linkRes = await pool.query(`
            UPDATE public.orders o
            SET user_id = p.id
            FROM public.profiles p
            WHERE LOWER(o.customer_email) = LOWER(p.email) 
            AND o.user_id IS NULL;
        `);
        console.log(`✅ Linked ${linkRes.rowCount} orders by email.`);

        // 3. Check for specific user 'ksv1619aditya@gmail.com'
        const adityaRes = await pool.query('SELECT p.id, p.email, count(o.id) as order_count FROM profiles p LEFT JOIN orders o ON o.user_id = p.id WHERE p.email ILIKE $1 GROUP BY p.id, p.email', ['ksv1619aditya@gmail.com']);
        if (adityaRes.rows.length > 0) {
            console.log('--- ADITYA ACCOUNT STATUS ---');
            console.table(adityaRes.rows);
        } else {
            console.log('❌ ksv1619aditya@gmail.com has NO profile record!');
        }

        // 4. Special fix: if admin@dhanyalifestyle.com orders exist, but no auth user, 
        // maybe they belong to the ksv1619aditya account? (Assuming that's the user's personal email)
        // User said "act as cto", maybe they are checking their admin orders under their personal account?
        // Let's check the emails.
        const unlinked = await pool.query('SELECT customer_email, count(*) FROM orders WHERE user_id IS NULL GROUP BY customer_email');
        console.log('--- REMAINING UNLINKED ORDERS ---');
        console.table(unlinked.rows);

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await pool.end();
    }
}

deepSync();
