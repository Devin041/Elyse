import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        const { data: order, error } = await supabase
            .from('orders')
            .select(`
                *,
                items:order_items(
                    id,
                    product_id,
                    variant_id,
                    product_name,
                    color_name,
                    size_name,
                    image_url,
                    unit_price,
                    quantity,
                    total_price
                )
            `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const mappedOrder = {
            ...order,
            status: order.order_status,
            user_email: order.customer_email,
            items: order.items?.map((item: any) => ({
                ...item,
                price_at_purchase: item.unit_price
            }))
        };

        return NextResponse.json({
            success: true,
            data: mappedOrder
        });

    } catch (error: any) {
        console.error('Get order error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
        return NextResponse.json(
            { error: 'Failed to fetch order', details: error.message, code: error.code },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: orderId } = await params;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        const supabase = createClient(supabaseUrl, serviceRoleKey || supabaseAnonKey);

        // 0. Delete Reviews (Fix for foreign key constraint)
        const { error: reviewsError } = await supabase
            .from('reviews')
            .delete()
            .eq('order_id', orderId);

        if (reviewsError) {
            console.error('Delete reviews error:', reviewsError);
            // Proceeding because the table might not exist or might be empty, but logging it is important.
        }

        // 1. Delete Order Items first (Manually cascade if needed, though DB might have it)
        const { error: itemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId);

        if (itemsError) {
            console.error('Delete order items error:', itemsError);
            // If table doesn't exist or other error, we might want to stop.
            // But for cleanup, we try to proceed to main order delete.
        }

        // 2. Delete the Order
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });

    } catch (error: any) {
        console.error('Delete order error:', error);
        return NextResponse.json(
            { error: 'Failed to delete order', details: error.message },
            { status: 500 }
        );
    }
}
