import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role key to see all orders (bypass RLS)
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        let query = supabase
            .from('orders')
            .select(`
                id,
                order_number,
                total_amount,
                order_status,
                payment_status,
                created_at,
                customer_email,
                shipping_city,
                shipping_state,
                profiles:user_id (
                    full_name,
                    email
                ),
                order_items (
                    id
                )
            `);

        if (status && status !== 'all') {
            query = query.eq('order_status', status);
        }

        const { data: orders, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        // Map status to match UI expectation if needed
        const mappedOrders = orders?.map(o => ({
            ...o,
            status: o.order_status, // UI expects .status
            user_email: o.customer_email || (o as any).profiles?.email || (o as any).profiles?.[0]?.email,
            items_count: o.order_items?.length || 0 // UI expects .items_count
        })) || [];

        return NextResponse.json({
            success: true,
            data: mappedOrders
        });

    } catch (error: any) {
        console.error('Orders API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders', details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role key for admin operations
        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const body = await request.json();
        const {
            customer_email,
            customer_phone,
            shipping_address,
            items,
            subtotal,
            tax,
            shipping_cost,
            total,
            payment_method
        } = body;

        // Validate required fields
        if (!customer_email || !customer_phone || !shipping_address || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate order number
        const orderNumber = await generateOrderNumber(supabase);

        // Create order in database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_email: customer_email,
                shipping_full_name: `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`.trim(),
                shipping_phone: customer_phone,
                shipping_address_line1: shipping_address.address,
                shipping_city: shipping_address.city,
                shipping_state: shipping_address.state,
                shipping_pincode: shipping_address.pincode,
                subtotal: subtotal || 0,
                discount_amount: 0,
                shipping_charge: shipping_cost || 0,
                total_amount: total || 0,
                payment_method: payment_method || 'cod',
                payment_status: payment_method === 'cod' ? 'pending' : 'paid',
                order_status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            throw orderError;
        }

        // Create order items with color and size
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.productId,
            variant_id: item.variantId,
            product_name: item.name,
            color_name: item.color || null,
            size_name: item.size || 'One Size',
            image_url: item.image,
            unit_price: item.price || 0,
            quantity: item.quantity || 1,
            total_price: (item.price || 0) * (item.quantity || 1)
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            console.error('Order items creation error:', itemsError);
            // Rollback
            await supabase.from('orders').delete().eq('id', order.id);
            throw itemsError;
        }

        // --- INVENTORY DEDUCTION ---
        for (const item of items) {
            if (item.variantId) {
                const { data: variant, error: fetchError } = await supabase
                    .from('product_variants')
                    .select('stock_quantity')
                    .eq('id', item.variantId)
                    .single();

                if (!fetchError && variant) {
                    const newStock = Math.max(0, (variant.stock_quantity || 0) - (item.quantity || 0));
                    await supabase
                        .from('product_variants')
                        .update({ stock_quantity: newStock })
                        .eq('id', item.variantId);
                }
            }
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                order_number: order.order_number
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Order creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create order', details: error.message },
            { status: 500 }
        );
    }
}

async function generateOrderNumber(supabase: any): Promise<string> {
    const { data, error } = await supabase
        .from('orders')
        .select('order_number')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching last order:', error);
    }

    if (!data || data.length === 0) {
        return 'ELY-2024-0001';
    }

    try {
        const lastNumberToken = data[0].order_number.split('-')[2];
        const lastNumber = parseInt(lastNumberToken);
        const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
        return `ELY-2024-${nextNumber}`;
    } catch (err) {
        return `ELY-2024-${Date.now().toString().slice(-4)}`;
    }
}
