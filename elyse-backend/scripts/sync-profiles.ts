import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncProfiles() {
    try {
        console.log('🚀 Starting profile sync and order linking...');

        // 1. Sync auth.users to public.profiles
        // We match by ID. Some profiles might already exist but have no email.
        const syncRes = await pool.query(`
            INSERT INTO public.profiles (id, email, updated_at)
            SELECT id, email, NOW() FROM auth.users
            ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();
        `);
        console.log(`✅ Synced ${syncRes.rowCount} profiles from auth.users.`);

        // 2. Link orders by email
        const linkRes = await pool.query(`
            UPDATE public.orders o
            SET user_id = p.id
            FROM public.profiles p
            WHERE o.customer_email = p.email AND o.user_id IS NULL;
        `);
        console.log(`✅ Linked ${linkRes.rowCount} orders to profiles by email.`);

        // 3. Check for specific user
        const userEmail = 'admin@dhanyalifestyle.com';
        const verifyRes = await pool.query('SELECT id, email FROM public.profiles WHERE email = $1', [userEmail]);
        if (verifyRes.rows.length > 0) {
            console.log('✅ Found admin profile:', verifyRes.rows[0].id);
        } else {
            console.log('❌ Admin profile still missing!');
        }

    } catch (error) {
        console.error('❌ Sync failed:', error);
    } finally {
        await pool.end();
    }
}

syncProfiles();
