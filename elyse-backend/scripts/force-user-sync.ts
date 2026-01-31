import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncUsers() {
    try {
        console.log('🚀 Starting user sync and order linking...');

        // 1. Sync auth.users to public.users
        const syncRes = await pool.query(`
            INSERT INTO public.users (id, email)
            SELECT id, email FROM auth.users
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
        `);
        console.log(`✅ Synced ${syncRes.rowCount} users from auth.users to public.users.`);

        // 2. Link orders by email
        const linkRes = await pool.query(`
            UPDATE public.orders o
            SET user_id = u.id
            FROM public.users u
            WHERE o.customer_email = u.email AND o.user_id IS NULL;
        `);
        console.log(`✅ Linked ${linkRes.rowCount} orders to user accounts by email.`);

        // 3. Verify admin user
        const adminRes = await pool.query("SELECT id, email FROM public.users WHERE email = 'admin@dhanyalifestyle.com'");
        if (adminRes.rows.length > 0) {
            console.log('✅ Found admin user in public.users:', adminRes.rows[0].id);
        } else {
            console.log('❌ Admin user still missing from public.users!');
        }

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await pool.end();
    }
}

syncUsers();
