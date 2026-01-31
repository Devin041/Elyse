import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const c = await pool.connect();
    try {
        console.log('👤 Creating test user...\n');

        const testUserId = '00000000-0000-0000-0000-000000000001';
        const testEmail = 'test@example.com';

        // Try to insert into auth.users (might fail if no permissions, but usually works with service role)
        try {
            await c.query(`
            INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
            VALUES ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, 'password', NOW(), NOW(), NOW())
            ON CONFLICT (id) DO NOTHING
        `, [testUserId, testEmail]);
            console.log('   ✓ Inserted into auth.users');
        } catch (e: any) {
            console.log('   ⚠️  Could not insert into auth.users:', e.message);
            console.log('       Attempting to insert directly into profiles (might fail if FK constraint exists)...');
        }

        // Insert into profiles
        await c.query(`
        INSERT INTO public.profiles (id, email, full_name, phone, role, is_verified)
        VALUES ($1, $2, 'Test User', '9876543210', 'customer', true)
        ON CONFLICT (id) DO UPDATE SET full_name = 'Test User'
    `, [testUserId, testEmail]);

        console.log('   ✓ Inserted into public.profiles');

        console.log('\n✅ Test user created successfully!');

    } catch (e: any) {
        console.error('❌ Error:', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
