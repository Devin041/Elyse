import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        // Use service role if available to bypass RLS for order creation
        const supabase = serviceRoleKey
            ? createClient(supabaseUrl, serviceRoleKey)
            : createClient(supabaseUrl, supabaseAnonKey);

        const body = await request.json();
        console.log('Received order body:', JSON.stringify(body, null, 2));

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
            console.error('Validation failed: Missing fields');
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate order number
        const orderNumber = `ELY-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

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
            console.error('Order creation database error:', orderError);
            return NextResponse.json(
                { error: 'Failed to create order record', details: orderError.message },
                { status: 500 }
            );
        }

        console.log('Order created successfully:', order.id);

        // Create order items
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
            console.error('Order items creation database error:', itemsError);
            // Rollback
            await supabase.from('orders').delete().eq('id', order.id);
            return NextResponse.json(
                { error: 'Failed to create order items', details: itemsError.message },
                { status: 500 }
            );
        }

        console.log('Order items created successfully');

        // --- INVENTORY DEDUCTION ---
        try {
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
        } catch (invError) {
            console.error('Inventory deduction non-fatal error:', invError);
            // Don't fail the whole order if inventory update fails
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                order_number: order.order_number
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Order API unexpected internal error:', error);
        return NextResponse.json(
            { error: 'An unexpected internal error occurred', details: error.message },
            { status: 500 }
        );
    }
}
