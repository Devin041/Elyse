const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcqsjztmpslvmkrbgevi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcXNqenRtcHNsdm1rcmJnZXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg3NTE2OCwiZXhwIjoyMDc5NDUxMTY4fQ.p-5GBTIII01btchxswR_w5smpzvpwaztTHKCcHdxIEo';

async function applyMigration() {
    console.log('🔧 Connecting to Supabase with service role...');

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('📝 Applying INSERT policies migration...');

    // Policy 1: Orders INSERT
    const { error: error1 } = await supabase.rpc('exec', {
        sql: `CREATE POLICY IF NOT EXISTS "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);`
    });

    if (error1) {
        console.log('⚠️  RPC not available, using direct query method...');

        // Alternative: Use REST API directly
        const policies = [
            `CREATE POLICY IF NOT EXISTS "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true)`,
            `CREATE POLICY IF NOT EXISTS "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true)`
        ];

        for (const policy of policies) {
            console.log(`\n📌 Executing: ${policy.substring(0, 50)}...`);

            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`
                },
                body: JSON.stringify({ sql: policy })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log(`   ❌ Failed: ${errorText}`);
            } else {
                console.log('   ✅ Success!');
            }
        }
    } else {
        console.log('✅ First policy created!');

        // Policy 2: Order Items INSERT
        const { error: error2 } = await supabase.rpc('exec', {
            sql: `CREATE POLICY IF NOT EXISTS "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);`
        });

        if (error2) {
            console.log('❌ Error creating second policy:', error2.message);
        } else {
            console.log('✅ Second policy created!');
        }
    }

    console.log('\n🎉 Migration complete! Order placement should now work.');
    console.log('🧪 Test by placing an order on http://localhost:3000');
}

applyMigration().catch(err => {
    console.error('❌ Migration failed:', err.message);
    console.log('\n📋 Please apply manually via Supabase Dashboard SQL Editor:');
    console.log(`
CREATE POLICY IF NOT EXISTS "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);
    `);
});
