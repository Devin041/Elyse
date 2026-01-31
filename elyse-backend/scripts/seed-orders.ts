import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatuses = ['pending', 'paid', 'failed'];

async function run() {
    const c = await pool.connect();
    try {
        console.log('🌱 Seeding orders...\n');

        // Get profiles (users)
        let profiles = await c.query('SELECT id, full_name, phone FROM profiles LIMIT 10');

        if (profiles.rows.length === 0) {
            console.log('⚠️  No profiles found. Checking auth.users...');
            try {
                const authUsers = await c.query('SELECT id, email FROM auth.users LIMIT 5');
                if (authUsers.rows.length > 0) {
                    for (const u of authUsers.rows) {
                        await c.query(`
                     INSERT INTO public.profiles (id, full_name, email, role)
                     VALUES ($1, $2, $3, 'customer')
                     ON CONFLICT (id) DO NOTHING
                 `, [u.id, 'Test User', u.email]);
                    }
                    profiles = await c.query('SELECT id, full_name, phone FROM profiles LIMIT 10');
                }
            } catch (e) {
                console.log('   Could not access auth.users, proceeding with existing profiles check.');
            }
        }

        if (profiles.rows.length === 0) {
            console.log('❌ No users found to attach orders to. Please sign up a user first.');
            return;
        }

        const products = await c.query('SELECT id, name, sale_price FROM products');
        const variants = await c.query(`
        SELECT v.id, v.product_id, v.stock_quantity, c.color_name, s.size_name 
        FROM product_variants v
        LEFT JOIN product_colors c ON v.color_id = c.id
        LEFT JOIN product_sizes s ON v.size_id = s.id
    `);

        let oc = 0, oic = 0;

        for (let i = 0; i < 25; i++) {
            const profile = profiles.rows[Math.floor(Math.random() * profiles.rows.length)];
            const orderStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
            const paymentStatus = orderStatus === 'delivered' ? 'paid' : (orderStatus === 'cancelled' ? 'failed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]);

            const daysAgo = Math.floor(Math.random() * 30);
            const orderDate = new Date();
            orderDate.setDate(orderDate.getDate() - daysAgo);

            const numItems = Math.floor(Math.random() * 3) + 1;
            let subtotal = 0;
            const selectedItems: any[] = [];

            for (let j = 0; j < numItems; j++) {
                const p = products.rows[Math.floor(Math.random() * products.rows.length)];
                const prodVariants = variants.rows.filter((v: any) => v.product_id === p.id);
                const variant = prodVariants.length > 0 ? prodVariants[Math.floor(Math.random() * prodVariants.length)] : null;

                const qty = Math.floor(Math.random() * 2) + 1;
                const price = parseFloat(p.sale_price);

                selectedItems.push({
                    product: p,
                    variant: variant,
                    qty: qty,
                    price: price,
                    total: price * qty
                });
                subtotal += price * qty;
            }

            const shipping = 100;
            const total = subtotal + shipping;

            const or = await c.query(`
        INSERT INTO orders (
            user_id, 
            subtotal, 
            shipping_charge, 
            total_amount, 
            order_status, 
            payment_status, 
            shipping_full_name,
            shipping_phone,
            shipping_address_line1,
            shipping_city,
            shipping_state,
            shipping_pincode,
            created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING id
      `, [
                profile.id,
                subtotal,
                shipping,
                total,
                orderStatus,
                paymentStatus,
                profile.full_name || 'Test User',
                profile.phone || '9876543210',
                '123 Test St',
                'Mumbai',
                'Maharashtra',
                '400001',
                orderDate
            ]);

            const orderId = or.rows[0].id;
            oc++;

            for (const item of selectedItems) {
                await c.query(`
          INSERT INTO order_items (
              order_id, 
              product_id, 
              variant_id, 
              quantity, 
              unit_price, 
              total_price,
              product_name,
              color_name,
              size_name
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
                    orderId,
                    item.product.id,
                    item.variant?.id || null,
                    item.qty,
                    item.price,
                    item.total,
                    item.product.name,
                    item.variant?.color_name || null,
                    item.variant?.size_name || null
                ]);
                oic++;
            }

            console.log(`✓ Order #${i + 1} (${orderStatus}, ₹${total})`);
        }

        console.log(`\n${'='.repeat(50)}\n✅ Orders: ${oc}, Order Items: ${oic}\n${'='.repeat(50)}`);
    } catch (e: any) {
        console.error('❌', e.message);
    } finally {
        c.release();
        await pool.end();
    }
}
run();
