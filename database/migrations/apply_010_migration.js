// Quick script to apply the missing INSERT policies
require('dotenv').config({ path: '../elyse-store/.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function applyMigration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
        process.exit(1);
    }

    console.log('🔧 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const migrationSQL = `
-- Add INSERT policy for orders table
CREATE POLICY IF NOT EXISTS "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Add INSERT policy for order_items table
CREATE POLICY IF NOT EXISTS "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);
`;

    console.log('📝 Applying migration...');
    console.log(migrationSQL);

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
        // Try alternative method using raw SQL
        console.log('⚠️ RPC method failed, trying alternative...');

        // Split queries and execute one by one
        const queries = [
            `CREATE POLICY IF NOT EXISTS "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true)`,
            `CREATE POLICY IF NOT EXISTS "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true)`
        ];

        for (const query of queries) {
            console.log(`Executing: ${query.substring(0, 50)}...`);
            const { error: queryError } = await supabase.from('_migration_temp').select('*').limit(0);

            if (queryError) {
                console.error('❌ Error:', queryError.message);
            }
        }

        console.log('⚠️ Could not apply via supabase-js. Please apply manually via Supabase Dashboard.');
        console.log('\n📋 SQL to run in Supabase SQL Editor:');
        console.log(migrationSQL);
        return;
    }

    console.log('✅ Migration applied successfully!');
    console.log('🎉 Order placement should now work!');
}

applyMigration().catch(console.error);
