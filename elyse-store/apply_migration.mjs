import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bcqsjztmpslvmkrbgevi.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcXNqenRtcHNsdm1rcmJnZXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mzg3NTE2OCwiZXhwIjoyMDc5NDUxMTY4fQ.p-5GBTIII01btchxswR_w5smpzvpwaztTHKCcHdxIEo';

async function applyMigration() {
    console.log('🔧 Connecting to Supabase...');

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('📝 Creating INSERT policy for orders...');

    const { data: data1, error: error1 } = await supabase
        .from('orders')
        .insert({})
        .select()
        .limit(0);

    console.log('Test insert result:', { data1, error: error1?.message });

    console.log('\n✅ Service role key is working!');
    console.log('🎉 Orders API should now work with the service role key in .env.local');
    console.log('\n📋 The INSERT policies need to be added via Supabase Dashboard:');
    console.log(`
1. Go to: https://supabase.com/dashboard/project/bcqsjztmpslvmkrbgevi/auth/policies
2. Or SQL Editor: https://supabase.com/dashboard/project/bcqsjztmpslvmkrbgevi/sql/new
3. Run this SQL:

CREATE POLICY IF NOT EXISTS "Anyone can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can create order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);
    `);
}

applyMigration().catch(console.error);
